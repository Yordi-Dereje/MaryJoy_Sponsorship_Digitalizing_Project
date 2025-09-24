const express = require('express');
const router = express.Router();
const { sequelize, Sequelize } = require('../models');

// Helper: month index to name (1-12)
const monthNames = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

// GET financial report: sponsors with last payment, payment history summary, phone and beneficiaries count
// Query params: startYear, startMonth, endYear, endMonth, status (paid|unpaid|all), search
router.get('/report', async (req, res) => {
  try {
    const {
      startYear,
      startMonth,
      endYear,
      endMonth,
      status = 'all',
      search = ''
    } = req.query;

    // Build date filter for payments
    const hasRange = startYear && startMonth && endYear && endMonth;
    const startDate = hasRange ? new Date(Number(startYear), Number(startMonth) - 1, 1) : null;
    const endDate = hasRange ? new Date(Number(endYear), Number(endMonth) - 1, 28) : null;

    // Base query: sponsors with latest payment aggregated and counts
    // Using raw SQL for performance and to avoid ORM association complexity
    const query = `
      WITH latest_payment AS (
        SELECT p.sponsor_cluster_id, p.sponsor_specific_id,
               MAX((p.year::text || LPAD(p.end_month::text, 2, '0'))) AS yyyymm
        FROM payments p
        GROUP BY p.sponsor_cluster_id, p.sponsor_specific_id
      ), payment_rows AS (
        SELECT p.*
        FROM payments p
        JOIN latest_payment lp ON lp.sponsor_cluster_id = p.sponsor_cluster_id
                              AND lp.sponsor_specific_id = p.sponsor_specific_id
                              AND (p.year::text || LPAD(p.end_month::text, 2, '0')) = lp.yyyymm
      ), beneficiary_counts AS (
        SELECT sp.sponsor_cluster_id, sp.sponsor_specific_id,
               COUNT(*) FILTER (WHERE sp.status = 'active') AS active_beneficiaries
        FROM sponsorships sp
        GROUP BY sp.sponsor_cluster_id, sp.sponsor_specific_id
      )
      SELECT s.cluster_id, s.specific_id, s.full_name, s.phone_number, s.starting_date,
             COALESCE(bc.active_beneficiaries, 0) AS beneficiaries,
             pr.start_month AS last_payment_start_month,
             pr.end_month AS last_payment_month,
             pr.year AS last_payment_year
      FROM sponsors s
      LEFT JOIN payment_rows pr ON pr.sponsor_cluster_id = s.cluster_id
                               AND pr.sponsor_specific_id = s.specific_id
      LEFT JOIN beneficiary_counts bc ON bc.sponsor_cluster_id = s.cluster_id
                                     AND bc.sponsor_specific_id = s.specific_id
      WHERE ($1 = 'all' OR s.status = $1)
    `;

    const results = await sequelize.query(query, {
      bind: [status],
      type: Sequelize.QueryTypes.SELECT
    });

    // Map and filter by date/search on server side
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    const calcMonthsInclusive = (startYear, startMonth, endYear, endMonth) => {
      if (!startYear || !startMonth || !endYear || !endMonth) return 0;
      return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    };

    const mapped = results.map(r => {
      const lastPayment = (r.last_payment_month && r.last_payment_year)
        ? `${monthNames[Math.max(1, Math.min(12, r.last_payment_month)) - 1]} ${r.last_payment_year}`
        : null;

      // Determine status: unpaid if last payment is before the current month-year
      let computedStatus = 'unpaid';
      if (r.last_payment_month && r.last_payment_year) {
        const paidOrdinal = r.last_payment_year * 12 + r.last_payment_month;
        const currentOrdinal = currentYear * 12 + currentMonth;
        computedStatus = paidOrdinal >= currentOrdinal ? 'paid' : 'unpaid';
      }

      // Compute monthsPaid from most recent payment record only (inclusive)
      let monthsPaid = 0;
      if (r.last_payment_year && (r.last_payment_month || r.last_payment_start_month)) {
        const startM = r.last_payment_start_month || r.last_payment_month;
        const endM = r.last_payment_month || r.last_payment_start_month;
        monthsPaid = calcMonthsInclusive(r.last_payment_year, startM, r.last_payment_year, endM);
      }
      return {
        id: `${r.cluster_id}-${r.specific_id}`,
        name: r.full_name,
        phone: r.phone_number || 'N/A',
        lastPayment,
        status: computedStatus,
        paymentHistory: [],
        monthsPaid,
        beneficiaries: Number(r.beneficiaries) || 0,
        lastPaymentStartMonth: r.last_payment_start_month || null,
        lastPaymentMonth: r.last_payment_month || null,
        lastPaymentYear: r.last_payment_year || null,
        cluster_id: r.cluster_id,
        specific_id: r.specific_id
      };
    });

    let filtered = mapped;

    // Date range filter if provided
    if (hasRange) {
      filtered = filtered.filter(item => {
        if (!item.lastPaymentMonth || !item.lastPaymentYear) return false;
        const d = new Date(item.lastPaymentYear, item.lastPaymentMonth - 1, 1);
        const paidAhead = (item.lastPaymentYear > currentYear) || (item.lastPaymentYear === currentYear && item.lastPaymentMonth > currentMonth);
        return (d >= startDate && d <= endDate) || paidAhead;
      });
    }

    // Search filter
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(q) ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.phone || '').toLowerCase().includes(q)
      );
    }

    res.json({ sponsors: filtered });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET detailed payment history for a sponsor
router.get('/sponsors/:cluster_id/:specific_id/payments', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;
    const rows = await sequelize.query(
      `SELECT month := CASE WHEN end_month IS NOT NULL THEN end_month ELSE start_month END,
              start_month, end_month, year, payment_date, amount
       FROM payments
       WHERE sponsor_cluster_id = $1 AND sponsor_specific_id = $2
       ORDER BY year DESC, COALESCE(end_month, start_month) DESC, payment_date DESC`,
      { bind: [cluster_id, specific_id], type: Sequelize.QueryTypes.SELECT }
    );

    const history = rows.map(r => ({
      month: monthNames[(r.end_month || r.start_month) - 1] || 'Unknown',
      year: r.year,
      status: 'paid',
      amount: r.amount,
      payment_date: r.payment_date
    }));

    res.json({ payments: history });
  } catch (error) {
    console.error('Error fetching sponsor payments:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;




// Create a new payment record for a sponsor
router.post('/sponsors/:cluster_id/:specific_id/payments', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;
    const {
      start_month,
      end_month,
      year,
      amount = 0,
      reference_number = null,
      confirmed_by
    } = req.body;

    if (!year || !start_month) {
      return res.status(400).json({ error: 'start_month and year are required' });
    }

    const insertSql = `
      INSERT INTO payments (
        sponsor_cluster_id,
        sponsor_specific_id,
        payment_date,
        amount,
        start_month,
        end_month,
        year,
        reference_number,
        confirmed_by,
        created_at,
        updated_at
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, sponsor_cluster_id, sponsor_specific_id, payment_date, amount, start_month, end_month, year, reference_number, confirmed_by, created_at
    `;

    const [rows] = await sequelize.query(insertSql, {
      bind: [cluster_id, specific_id, amount, start_month, end_month || null, year, reference_number, confirmed_by || null]
    });

    const created = rows && rows[0] ? rows[0] : null;
    return res.status(201).json({ payment: created });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

