const express = require('express');
const bcrypt = require('bcrypt');
const { Sponsor, Address, Employee, PhoneNumber, Sponsorship, Beneficiary, UserCredentials, Payment, sequelize, Sequelize } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const bankReceiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'bank_receipts');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `bank-receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const allowedReceiptTypes = /pdf|jpg|jpeg|png/;

const bankReceiptUpload = multer({
  storage: bankReceiptStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extValid = allowedReceiptTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowedReceiptTypes.test(file.mimetype.toLowerCase());
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF or image files.'));
    }
  }
});

const router = express.Router();
const db = require('../config/database');

// GET all sponsors
// Alternative approach in the GET / route
router.get('/', async (req, res) => {
  try {
    const { search, type, residency, beneficiaryType, status } = req.query;
    
    // Build where conditions - default to active sponsors only
    let whereClause = { status: 'active' };
    if (status) whereClause.status = status;
    if (type && type !== 'all') {
      whereClause.type = type === 'Individual' ? 'individual' : 'organization';
    }
    if (residency && residency !== 'all') {
      whereClause.is_diaspora = residency === 'Diaspora';
    }

    // Additional filter for "new" logical status (last 30 days)
    const createdAfter = status === 'new' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null;

    // Find sponsors with basic filters (use correct association aliases)
    const sponsors = await Sponsor.findAll({
      where: {
        ...whereClause,
        ...(createdAfter ? { created_at: { [Sequelize.Op.gte]: createdAfter } } : {})
      },
      include: [
        { model: Address, as: 'address' },
        { model: Employee, as: 'creator', attributes: ['full_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    // Get beneficiary counts for each sponsor (raw SQL to avoid alias issues)
    const sponsorsWithCounts = await Promise.all(
      sponsors.map(async (sponsor) => {
        const [beneficiaryRows] = await sequelize.query(
          `SELECT 
             COALESCE(SUM(CASE WHEN b.type = 'child' AND sp.status = 'active' THEN 1 ELSE 0 END), 0)::int as children,
             COALESCE(SUM(CASE WHEN b.type = 'elderly' AND sp.status = 'active' THEN 1 ELSE 0 END), 0)::int as elders
           FROM sponsorships sp
           LEFT JOIN beneficiaries b ON b.id = sp.beneficiary_id
           WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2`,
          { bind: [sponsor.cluster_id, sponsor.specific_id] }
        );

        const [requestRows] = await sequelize.query(
          `SELECT 
             COALESCE(SUM(number_of_child_beneficiaries), 0)::int AS requested_children,
             COALESCE(SUM(number_of_elderly_beneficiaries), 0)::int AS requested_elders
           FROM sponsor_requests
           WHERE sponsor_cluster_id = $1 AND sponsor_specific_id = $2`,
          { bind: [sponsor.cluster_id, sponsor.specific_id] }
        );

        const actualChildren = beneficiaryRows?.[0]?.children || 0;
        const actualElders = beneficiaryRows?.[0]?.elders || 0;
        const requestedChildren = requestRows?.[0]?.requested_children || 0;
        const requestedElders = requestRows?.[0]?.requested_elders || 0;

        const childrenCount = sponsor.status === 'pending_review' ? requestedChildren : actualChildren;
        const eldersCount = sponsor.status === 'pending_review' ? requestedElders : actualElders;

        return {
          id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
          cluster_id: sponsor.cluster_id,
          specific_id: sponsor.specific_id,
          name: sponsor.full_name,
          type: sponsor.type,
          is_diaspora: sponsor.is_diaspora,
          phone: sponsor.phone_number || 'N/A',
          address: sponsor.address || null,
          creator: sponsor.creator || null,
          beneficiaryCount: { children: childrenCount, elders: eldersCount },
          requestedBeneficiaryCount: { children: requestedChildren, elders: requestedElders },
          status: sponsor.status,
          monthly_amount: sponsor.agreed_monthly_payment,
          starting_date: sponsor.starting_date,
          created_at: sponsor.created_at
        };
      })
    );

    // Apply search filter
    let filteredSponsors = sponsorsWithCounts;
    if (search && search.trim() !== '') {
      const searchTerm = search.toLowerCase();
      filteredSponsors = sponsorsWithCounts.filter(sponsor => 
        sponsor.name.toLowerCase().includes(searchTerm) ||
        sponsor.id.toLowerCase().includes(searchTerm) ||
        sponsor.phone.toLowerCase().includes(searchTerm)
      );
    }

    // Apply beneficiary type filter
    if (beneficiaryType && beneficiaryType !== 'all') {
      filteredSponsors = filteredSponsors.filter(sponsor => {
        switch (beneficiaryType) {
          case 'child': return sponsor.beneficiaryCount.children > 0;
          case 'elderly': return sponsor.beneficiaryCount.elders > 0;
          case 'both': return sponsor.beneficiaryCount.children > 0 && sponsor.beneficiaryCount.elders > 0;
          default: return true;
        }
      });
    }

    res.json({
      sponsors: filteredSponsors,
      total: filteredSponsors.length,
      message: 'Sponsors fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});


// GET active sponsors with sponsor request counts
router.get('/active/with-request-counts', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `WITH request_counts AS (
         SELECT
           sr.sponsor_cluster_id,
           sr.sponsor_specific_id,
           COUNT(*)::int AS total_requests,
           COUNT(CASE WHEN sr.status = 'pending' THEN 1 END)::int AS pending_requests
         FROM sponsor_requests sr
         GROUP BY sr.sponsor_cluster_id, sr.sponsor_specific_id
       )
       SELECT
         s.cluster_id,
         s.specific_id,
         s.full_name,
         s.type,
         s.is_diaspora,
         s.phone_number,
         s.agreed_monthly_payment,
         s.starting_date,
         s.created_at,
         rc.total_requests,
         rc.pending_requests
       FROM sponsors s
       INNER JOIN request_counts rc
         ON rc.sponsor_cluster_id = s.cluster_id
        AND rc.sponsor_specific_id = s.specific_id
       WHERE s.status = 'active'
       ORDER BY s.created_at DESC`
    );

    const sponsors = rows.map((row) => ({
      id: `${row.cluster_id}-${row.specific_id}`,
      cluster_id: row.cluster_id,
      specific_id: row.specific_id,
      name: row.full_name,
      type: row.type,
      is_diaspora: row.is_diaspora,
      phone: row.phone_number || 'N/A',
      monthly_amount: row.agreed_monthly_payment,
      starting_date: row.starting_date,
      created_at: row.created_at,
      requestCounts: {
        total: Number.parseInt(row.total_requests, 10) || 0,
        pending: Number.parseInt(row.pending_requests, 10) || 0
      }
    }));

    const aggregate = sponsors.reduce(
      (acc, sponsor) => {
        acc.totalRequests += sponsor.requestCounts.total;
        acc.pendingRequests += sponsor.requestCounts.pending;
        return acc;
      },
      { totalRequests: 0, pendingRequests: 0 }
    );

    res.json({
      sponsors,
      total: sponsors.length,
      counts: {
        activeSponsorsWithRequests: sponsors.length,
        totalRequests: aggregate.totalRequests,
        pendingRequests: aggregate.pendingRequests
      },
      message: 'Active sponsors with sponsor request records fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching active sponsors with request counts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});



// GET inactive sponsors
router.get('/inactive', async (req, res) => {
  try {
    const { search, type, residency, beneficiaryType } = req.query;
    
    // Build where conditions for inactive sponsors
    let whereClause = { status: 'inactive' };
    if (type && type !== 'all') {
      whereClause.type = type === 'Individual' ? 'individual' : 'organization';
    }
    if (residency && residency !== 'all') {
      whereClause.is_diaspora = residency === 'Diaspora';
    }

    // Find inactive sponsors
    const sponsors = await Sponsor.findAll({
      where: whereClause,
      include: [
        { model: Address, as: 'address' },
        { model: Employee, as: 'creator', attributes: ['full_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    // Get beneficiary counts for each sponsor (raw SQL to avoid alias issues)
    const sponsorsWithCounts = await Promise.all(
      sponsors.map(async (sponsor) => {
        const [childRows] = await sequelize.query(
          `SELECT COUNT(*)::int AS count
           FROM sponsorships sp
           JOIN beneficiaries b ON b.id = sp.beneficiary_id
           WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
             AND sp.status = 'active' AND b.type = 'child'`,
          { bind: [sponsor.cluster_id, sponsor.specific_id] }
        );
        const [elderRows] = await sequelize.query(
          `SELECT COUNT(*)::int AS count
           FROM sponsorships sp
           JOIN beneficiaries b ON b.id = sp.beneficiary_id
           WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
             AND sp.status = 'active' AND b.type = 'elderly'`,
          { bind: [sponsor.cluster_id, sponsor.specific_id] }
        );
        const childrenCount = childRows?.[0]?.count || 0;
        const eldersCount = elderRows?.[0]?.count || 0;

        return {
          // IDs
          id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
          cluster_id: sponsor.cluster_id,
          specific_id: sponsor.specific_id,
          // Basic fields expected by frontend list
          name: sponsor.full_name,
          type: sponsor.type, // keep as 'individual' | 'organization'
          is_diaspora: sponsor.is_diaspora,
          phone: sponsor.phone_number || 'N/A',
          // Counts
          beneficiaryCount: {
            children: childrenCount,
            elders: eldersCount
          },
          status: sponsor.status,
          monthly_amount: sponsor.agreed_monthly_payment,
          starting_date: sponsor.starting_date
        };
      })
    );

    // Apply search filter
    let filteredSponsors = sponsorsWithCounts;
    if (search && search.trim() !== '') {
      const searchTerm = search.toLowerCase();
      filteredSponsors = sponsorsWithCounts.filter(sponsor => 
        sponsor.name.toLowerCase().includes(searchTerm) ||
        sponsor.id.toLowerCase().includes(searchTerm) ||
        sponsor.phone.toLowerCase().includes(searchTerm)
      );
    }

    // Apply beneficiary type filter
    if (beneficiaryType && beneficiaryType !== 'all') {
      filteredSponsors = filteredSponsors.filter(sponsor => {
        const children = sponsor.beneficiaryCount.children;
        const elders = sponsor.beneficiaryCount.elders;
        
        switch (beneficiaryType) {
          case 'child':
            return children > 0 && elders === 0;
          case 'elderly':
            return elders > 0 && children === 0;
          case 'both':
            return children > 0 && elders > 0;
          default:
            return true;
        }
      });
    }

    res.json({
      sponsors: filteredSponsors,
      total: filteredSponsors.length,
      message: 'Inactive sponsors fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching inactive sponsors:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET sponsor by composite ID (cluster_id-specific_id)
router.get('/:cluster_id/:specific_id', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;

    // Fetch sponsor core info with address and creator names
    const [rows] = await sequelize.query(
      `SELECT s.*, a.country, a.region, a.sub_region, a.woreda, a.house_number,
              e.full_name AS created_by_name
         FROM sponsors s
         LEFT JOIN addresses a ON s.address_id = a.id
         LEFT JOIN employees e ON s.created_by = e.id
        WHERE s.cluster_id = $1 AND s.specific_id = $2`,
      { bind: [cluster_id, specific_id] }
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    const sponsor = rows[0];

    // Accurate counts from sponsorships table
    const [[totalRow]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count
         FROM sponsorships sp
        WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2`,
      { bind: [cluster_id, specific_id] }
    );
    const [[activeRow]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count
         FROM sponsorships sp
        WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
          AND sp.status = 'active'`,
      { bind: [cluster_id, specific_id] }
    );
    const [[childrenRow]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count
         FROM sponsorships sp
         JOIN beneficiaries b ON b.id = sp.beneficiary_id
        WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
          AND sp.status = 'active' AND b.type = 'child'`,
      { bind: [cluster_id, specific_id] }
    );
    const [[eldersRow]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count
         FROM sponsorships sp
         JOIN beneficiaries b ON b.id = sp.beneficiary_id
        WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
          AND sp.status = 'active' AND b.type = 'elderly'`,
      { bind: [cluster_id, specific_id] }
    );

    const response = {
      id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
      cluster_id: sponsor.cluster_id,
      specific_id: sponsor.specific_id,
      type: sponsor.type,
      full_name: sponsor.full_name,
      email: sponsor.email,
      date_of_birth: sponsor.date_of_birth,
      gender: sponsor.gender,
      starting_date: sponsor.starting_date,
      monthly_amount: sponsor.agreed_monthly_payment,
      emergency_contact_name: sponsor.emergency_contact_name,
      emergency_contact_phone: sponsor.emergency_contact_phone,
      status: sponsor.status,
      is_diaspora: sponsor.is_diaspora,
      address: sponsor.address_id ? {
        country: sponsor.country,
        region: sponsor.region,
        sub_region: sponsor.sub_region,
        woreda: sponsor.woreda,
        house_number: sponsor.house_number
      } : null,
      created_by: sponsor.created_by_name,
      phone_numbers: {
        primary: sponsor.phone_number || null,
        secondary: null,
        tertiary: null
      },
      consent_document_url: sponsor.consent_document_url,
      total_beneficiaries: totalRow?.count || 0,
      active_beneficiaries: activeRow?.count || 0,
      children_beneficiaries: childrenRow?.count || 0,
      elderly_beneficiaries: eldersRow?.count || 0,
      created_at: sponsor.created_at,
      updated_at: sponsor.updated_at
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET sponsor's beneficiaries
router.get('/:cluster_id/:specific_id/beneficiaries', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;
    
    const query = `
      SELECT DISTINCT ON (b.id)
        b.*,
        g.full_name as guardian_name,
        COALESCE(
          (SELECT pn.primary_phone FROM phone_numbers pn 
           WHERE pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary' 
           ORDER BY pn.id ASC LIMIT 1),
          (SELECT pn.primary_phone FROM phone_numbers pn 
           WHERE pn.guardian_id = g.id AND pn.entity_type = 'guardian' 
           ORDER BY pn.id ASC LIMIT 1)
        ) as phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age,
        sp.start_date as sponsorship_start_date,
        sp.status as sponsorship_status
      FROM sponsorships sp
      JOIN beneficiaries b ON sp.beneficiary_id = b.id
      LEFT JOIN guardians g ON b.guardian_id = g.id
      WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
      AND sp.status = 'active'
      ORDER BY b.id
    `;

    const result = await sequelize.query(query, {
      bind: [cluster_id, specific_id],
      type: Sequelize.QueryTypes.SELECT
    });

    res.json({
      beneficiaries: result,
      total: result.length
    });

  } catch (error) {
    console.error('Error fetching sponsor beneficiaries:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// CREATE new sponsor
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const sponsorData = req.body;

    // Validate required fields
    if (!sponsorData.cluster_id || !sponsorData.specific_id || !sponsorData.full_name || !sponsorData.type || !sponsorData.phone_number) {
      return res.status(400).json({ error: 'Missing required fields (cluster_id, specific_id, full_name, type, phone_number)' });
    }

    // Check if sponsor already exists
    const existingSponsor = await Sponsor.findOne({
      where: {
        cluster_id: sponsorData.cluster_id,
        specific_id: sponsorData.specific_id
      }
    });

    if (existingSponsor) {
      return res.status(400).json({ error: 'Sponsor ID already exists' });
    }

    // Create sponsor
    const sponsor = await Sponsor.create(sponsorData, { transaction });

    // Auto-create user credentials for sponsor
    try {
      // Extract last 4 digits of phone number for password
      const phoneNumber = sponsorData.phone_number.replace(/\D/g, ''); // Remove non-digits
      const last4Digits = phoneNumber.slice(-4);
      
      if (last4Digits.length < 4) {
        console.warn(`Phone number ${sponsorData.phone_number} has less than 4 digits, using padded password`);
      }
      
      const password = last4Digits.padStart(4, '0'); // Pad with zeros if needed
      const password_hash = await bcrypt.hash(password, 12);

      // Create user credentials
      await UserCredentials.create({
        email: sponsorData.email || null, // Email is now optional
        phone_number: sponsorData.phone_number,
        password_hash,
        role: 'sponsor',
        sponsor_cluster_id: sponsorData.cluster_id,
        sponsor_specific_id: sponsorData.specific_id,
        is_active: true
      }, { transaction });

    } catch (credentialError) {
      console.error('Error creating user credentials for sponsor:', credentialError);
      // Don't fail the entire operation if credential creation fails
      // Just log the error and continue
    }

    await transaction.commit();

    res.status(201).json({
      message: 'Sponsor created successfully',
      sponsor
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating sponsor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE sponsor
router.put('/:cluster_id/:specific_id', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;
    const updates = req.body;

    const sponsor = await Sponsor.findOne({
      where: {
        cluster_id: cluster_id,
        specific_id: specific_id
      }
    });

    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    await sponsor.update(updates);

    res.json({
      message: 'Sponsor updated successfully',
      sponsor
    });

  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE sponsor
router.delete('/:cluster_id/:specific_id', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;

    const sponsor = await Sponsor.findOne({
      where: {
        cluster_id: cluster_id,
        specific_id: specific_id
      }
    });

    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    await sponsor.destroy();

    res.json({ message: 'Sponsor deleted successfully' });

  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET sponsor dashboard data by composite ID
router.get('/:cluster_id/:specific_id/dashboard', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;

    // Get sponsor basic info
    const [sponsorRows] = await sequelize.query(
      `SELECT s.*, a.country, a.region, a.sub_region, a.woreda, a.house_number
       FROM sponsors s
       LEFT JOIN addresses a ON s.address_id = a.id
       WHERE s.cluster_id = $1 AND s.specific_id = $2`,
      { bind: [cluster_id, specific_id] }
    );

    if (!sponsorRows || sponsorRows.length === 0) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    const sponsor = sponsorRows[0];

    // Get sponsorship counts
    const [[totalSponsorships]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count FROM sponsorships 
       WHERE sponsor_cluster_id = $1 AND sponsor_specific_id = $2`,
      { bind: [cluster_id, specific_id] }
    );

    const [[activeSponsorships]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count FROM sponsorships 
       WHERE sponsor_cluster_id = $1 AND sponsor_specific_id = $2 
       AND status = 'active'`,
      { bind: [cluster_id, specific_id] }
    );

    const [[childrenSponsorships]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count 
       FROM sponsorships sp
       JOIN beneficiaries b ON sp.beneficiary_id = b.id
       WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2 
       AND sp.status = 'active' AND b.type = 'child'`,
      { bind: [cluster_id, specific_id] }
    );

    const [[elderlySponsorships]] = await sequelize.query(
      `SELECT COUNT(*)::int AS count 
       FROM sponsorships sp
       JOIN beneficiaries b ON sp.beneficiary_id = b.id
       WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2 
       AND sp.status = 'active' AND b.type = 'elderly'`,
      { bind: [cluster_id, specific_id] }
    );

    // Get recent active sponsorships for display
    const [recentSponsorships] = await sequelize.query(
      `SELECT sp.*, b.full_name as beneficiary_name, b.type as beneficiary_type
       FROM sponsorships sp
       JOIN beneficiaries b ON sp.beneficiary_id = b.id
       WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
       AND sp.status = 'active'
       ORDER BY sp.start_date DESC
       LIMIT 5`,
      { bind: [cluster_id, specific_id] }
    );

    // Get payment information
    const [payments] = await sequelize.query(
      `SELECT * FROM payments 
       WHERE sponsor_cluster_id = $1 AND sponsor_specific_id = $2
       ORDER BY start_year DESC, end_year DESC, start_month DESC, end_month DESC`,
      { bind: [cluster_id, specific_id] }
    );

    // Calculate payment statistics
    let lastPayment = null;
    let nextPaymentDue = null;
    let totalContribution = 0;
    let monthsSupported = 0;

    if (payments.length > 0) {
      // Get the most recent payment
      const recentPayment = payments[0];
      lastPayment = {
        month: recentPayment.end_month || recentPayment.start_month,
        year: recentPayment.end_year || recentPayment.start_year
      };

      // Calculate next payment due (next month after last payment)
      let nextMonth = lastPayment.month + 1;
      let nextYear = lastPayment.year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      nextPaymentDue = { month: nextMonth, year: nextYear };

      // Calculate total contribution and months supported
      totalContribution = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      
      // Calculate months supported based on payment records
      const paymentMonths = new Set();
      payments.forEach(payment => {
        const startMonth = payment.start_month;
        const endMonth = payment.end_month || payment.start_month;
        const startYear = payment.start_year;
        const endYear = payment.end_year || payment.start_year;
        
        // Handle payments that span multiple years
        for (let year = startYear; year <= endYear; year++) {
          const monthStart = (year === startYear) ? startMonth : 1;
          const monthEnd = (year === endYear) ? endMonth : 12;
          for (let month = monthStart; month <= monthEnd; month++) {
            paymentMonths.add(`${year}-${month}`);
          }
        }
      });
      monthsSupported = paymentMonths.size;
    } else {
      // No payments yet - next payment due is current month
      const now = new Date();
      nextPaymentDue = { month: now.getMonth() + 1, year: now.getFullYear() };
    }

    // Get reports for the sponsor
    const [reports] = await sequelize.query(
      `SELECT * FROM reports  
       `,
      {}
    );

    const dashboardData = {
      sponsor: {
        cluster_id: sponsor.cluster_id,
        specific_id: sponsor.specific_id,
        sponsorId: `${sponsor.cluster_id}-${sponsor.specific_id}`,
        name: sponsor.full_name,
        email: sponsor.email,
        joinDate: sponsor.starting_date,
        phone: sponsor.phone_number,
        address: sponsor.country ? {
          country: sponsor.country,
          region: sponsor.region,
          sub_region: sponsor.sub_region,
          woreda: sponsor.woreda,
          house_number: sponsor.house_number
        } : null,
        status: sponsor.status,
        monthlyPayment: sponsor.agreed_monthly_payment,
        type: sponsor.type,
        gender: sponsor.gender,
        emergencyContactName: sponsor.emergency_contact_name,
        emergencyContactPhone: sponsor.emergency_contact_phone,
        memberSince: new Date(sponsor.starting_date).getFullYear(),
        isDiaspora: sponsor.is_diaspora
      },
      stats: {
        totalSponsorships: totalSponsorships?.count || 0,
        activeSponsorships: activeSponsorships?.count || 0,
        childrenSponsorships: childrenSponsorships?.count || 0,
        elderlySponsorships: elderlySponsorships?.count || 0,
        yearsOfSupport: new Date().getFullYear() - new Date(sponsor.starting_date).getFullYear() || 1
      },
      payments: {
        lastPayment,
        nextPaymentDue,
        totalContribution,
        monthsSupported,
        paymentHistory: payments.map(payment => ({
          id: payment.id,
          amount: parseFloat(payment.amount),
          paymentDate: payment.payment_date,
          startMonth: payment.start_month,
          endMonth: payment.end_month,
          startYear: payment.start_year,
          endYear: payment.end_year,
          bankReceiptUrl: payment.bank_receipt_url,
          companyReceiptUrl: payment.company_receipt_url,
          referenceNumber: payment.reference_number,
          status: payment.status,
          confirmedAt: payment.confirmed_at,
          confirmedBy: payment.confirmed_by
        }))
      },
      recentSponsorships: recentSponsorships,
      reports: reports.map(report => ({
        id: report.id,
        year: new Date(report.created_at).getFullYear(),
        title: report.title || 'Impact Report',
        description: report.description || 'Detailed report of sponsorship impact',
        published: new Date(report.created_at).toLocaleDateString(),
        format: 'PDF'
      })),
      lastLogin: new Date().toLocaleString()
    };

    // If no reports, add some default ones
    if (dashboardData.reports.length === 0) {
      const currentYear = new Date().getFullYear();
      dashboardData.reports = [
        {
          id: 1,
          year: currentYear,
          title: 'Annual Impact Report',
          description: 'Comprehensive overview of your impact this year',
          published: `${currentYear}-04-15`,
          format: 'PDF, 2.4MB'
        },
        {
          id: 2,
          year: currentYear - 1,
          title: 'Annual Report',
          description: 'See how your support made a difference',
          published: `${currentYear - 1}-03-28`,
          format: 'PDF, 2.1MB'
        }
      ];
    }

    res.json(dashboardData);

  } catch (error) {
    console.error('Error fetching sponsor dashboard data:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

router.post(
  '/:cluster_id/:specific_id/payments/receipts',
  bankReceiptUpload.single('bank_receipt'),
  async (req, res) => {
    try {
      const { cluster_id, specific_id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'Bank receipt file is required.' });
      }

      const bankReceiptUrl = `/uploads/bank_receipts/${req.file.filename}`;

      // Use current date for payment_date, set default values for other fields
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JS months are 0-based
      const currentYear = currentDate.getFullYear();

      const createdPayment = await Payment.create({
        sponsor_cluster_id: cluster_id,
        sponsor_specific_id: specific_id,
        amount: 0, // Default amount, can be updated later
        payment_date: currentDate, // Set current date for payment date
        start_month: currentMonth,
        end_month: null,
        start_year: currentYear,
        end_year: null,
        bank_receipt_url: bankReceiptUrl,
        company_receipt_url: null,
        reference_number: null,
        status: 'pending'
      });

      res.status(201).json({
        message: 'Bank receipt uploaded successfully',
        payment: createdPayment
      });
    } catch (error) {
      console.error('Error uploading bank receipt:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
);

// GET sponsor's sponsorships
router.get('/:cluster_id/:specific_id/sponsorships', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;
    
    const query = `
      SELECT 
        sp.*,
        b.full_name as beneficiary_name,
        b.type as beneficiary_type,
        b.date_of_birth,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as beneficiary_age,
        g.full_name as guardian_name
      FROM sponsorships sp
      JOIN beneficiaries b ON sp.beneficiary_id = b.id
      LEFT JOIN guardians g ON b.guardian_id = g.id
      WHERE sp.sponsor_cluster_id = $1 AND sp.sponsor_specific_id = $2
      ORDER BY sp.start_date DESC
    `;

    const result = await sequelize.query(query, {
      bind: [cluster_id, specific_id],
      type: Sequelize.QueryTypes.SELECT
    });

    res.json({
      sponsorships: result,
      total: result.length
    });

  } catch (error) {
    console.error('Error fetching sponsor sponsorships:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


module.exports = router;
