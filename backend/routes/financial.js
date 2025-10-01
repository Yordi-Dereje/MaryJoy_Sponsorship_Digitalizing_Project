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

    // Base query: sponsors with comprehensive payment data and counts
    // Using raw SQL for performance and to avoid ORM association complexity
    const query = `
      WITH payment_data AS (
        SELECT
          p.sponsor_cluster_id,
          p.sponsor_specific_id,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'amount', p.amount,
              'paymentDate', p.payment_date,
              'startMonth', p.start_month,
              'endMonth', p.end_month,
              'startYear', p.start_year,
              'endYear', p.end_year,
              'bankReceiptUrl', p.bank_receipt_url,
              'companyReceiptUrl', p.company_receipt_url,
              'referenceNumber', p.reference_number,
              'status', p.status,
              'confirmedAt', p.confirmed_at
            ) ORDER BY p.start_year DESC, p.start_month DESC
          ) as payment_history,
          MAX((COALESCE(p.end_year, p.start_year)::text || LPAD(COALESCE(p.end_month, p.start_month)::text, 2, '0'))) AS yyyymm
        FROM payments p
        GROUP BY p.sponsor_cluster_id, p.sponsor_specific_id
      ), beneficiary_counts AS (
        SELECT sp.sponsor_cluster_id, sp.sponsor_specific_id,
               COUNT(*) FILTER (WHERE sp.status = 'active') AS active_beneficiaries
        FROM sponsorships sp
        GROUP BY sp.sponsor_cluster_id, sp.sponsor_specific_id
      )
      SELECT s.cluster_id, s.specific_id, s.full_name, s.phone_number, s.starting_date,
             COALESCE(bc.active_beneficiaries, 0) AS beneficiaries,
             pd.payment_history,
             CASE
               WHEN pd.yyyymm IS NOT NULL THEN
                 LEFT(pd.yyyymm, 4)::int
               ELSE NULL
             END as last_payment_year,
             CASE
               WHEN pd.yyyymm IS NOT NULL THEN
                 RIGHT(pd.yyyymm, 2)::int
               ELSE NULL
             END as last_payment_month
      FROM sponsors s
      LEFT JOIN payment_data pd ON pd.sponsor_cluster_id = s.cluster_id
                                AND pd.sponsor_specific_id = s.specific_id
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

      // Calculate total contribution and months supported from payment history
      let totalContribution = 0;
      let monthsSupported = 0;
      if (r.payment_history && Array.isArray(r.payment_history)) {
        totalContribution = r.payment_history.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

        // Calculate unique months supported
        const paymentMonths = new Set();
        r.payment_history.forEach(payment => {
          const startMonth = payment.startMonth;
          const endMonth = payment.endMonth || payment.startMonth;
          const startYear = payment.startYear;
          const endYear = payment.endYear || payment.startYear;

          for (let year = startYear; year <= endYear; year++) {
            const monthStart = (year === startYear) ? startMonth : 1;
            const monthEnd = (year === endYear) ? endMonth : 12;
            for (let month = monthStart; month <= monthEnd; month++) {
              paymentMonths.add(`${year}-${month}`);
            }
          }
        });
        monthsSupported = paymentMonths.size;
      }

      return {
        id: `${r.cluster_id}-${r.specific_id}`,
        name: r.full_name,
        phone: r.phone_number || 'N/A',
        lastPayment: (r.last_payment_month && r.last_payment_year)
          ? `${monthNames[Math.max(1, Math.min(12, r.last_payment_month)) - 1]} ${r.last_payment_year}`
          : null,
        status: computedStatus,
        paymentHistory: r.payment_history || [],
        monthsPaid: monthsPaid,
        beneficiaries: Number(r.beneficiaries) || 0,
        lastPaymentStartMonth: null,
        lastPaymentMonth: r.last_payment_month || null,
        lastPaymentYear: r.last_payment_year || null,
        cluster_id: r.cluster_id,
        specific_id: r.specific_id,
        totalContribution: totalContribution,
        monthsSupported: monthsSupported
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

// Update payment record
router.put('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const {
      start_month,
      start_year,
      end_month,
      end_year,
      reference_number,
      company_receipt_url,
      confirmed_by,
      confirmed_at,
      status,
      amount
    } = req.body;

    const updateSql = `
      UPDATE payments 
      SET 
        start_month = COALESCE($2, start_month),
        start_year = COALESCE($3, start_year),
        end_month = COALESCE($4, end_month),
        end_year = COALESCE($5, end_year),
        reference_number = COALESCE($6, reference_number),
        company_receipt_url = COALESCE($7, company_receipt_url),
        confirmed_by = COALESCE($8, confirmed_by),
        confirmed_at = COALESCE($9, confirmed_at),
        status = COALESCE($10, status),
        amount = COALESCE($11, amount)
      WHERE id = $1
      RETURNING id, sponsor_cluster_id, sponsor_specific_id, payment_date, amount, start_month, start_year, end_month, end_year, reference_number, bank_receipt_url, company_receipt_url, status, confirmed_by, confirmed_at
    `;

    const [rows] = await sequelize.query(updateSql, {
      bind: [paymentId, start_month, start_year, end_month, end_year, reference_number, company_receipt_url, confirmed_by, confirmed_at, status, amount]
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updated = rows[0];
    return res.json({ payment: updated });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

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
        confirmed_by
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)
      RETURNING id, sponsor_cluster_id, sponsor_specific_id, payment_date, amount, start_month, end_month, year, reference_number, confirmed_by
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


module.exports = router;
