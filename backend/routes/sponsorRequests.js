const express = require('express');
const router = express.Router();
const { SponsorRequest, Sponsor, sequelize } = require('../models');

// GET /api/sponsor_requests?status=pending
// Uses JOINs to enrich with sponsor details and current beneficiary counts
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    const bindings = [];
    const whereConditions = [];

    if (status) {
      whereConditions.push(`sr.status = $${bindings.length + 1}`);
      bindings.push(status);
    }

    // Always restrict to sponsors that are currently active
    whereConditions.push("s.status = 'active'");

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        sr.id,
        sr.sponsor_cluster_id,
        sr.sponsor_specific_id,
        sr.number_of_child_beneficiaries,
        sr.number_of_elderly_beneficiaries,
        sr.total_beneficiaries,
        COALESCE(s.agreed_monthly_payment, 0) AS estimated_monthly_commitment,
        sr.status,
        sr.request_date,
        sr.created_by,
        sr.created_at,
        sr.reviewed_by,
        sr.reviewed_at,
        -- Sponsor details
        s.full_name AS sponsor_full_name,
        s.type AS sponsor_type,
        s.is_diaspora,
        s.phone_number,
        s.starting_date,
        s.agreed_monthly_payment,
        s.status AS sponsor_status,
        -- Current beneficiary counts from sponsorships
        COALESCE( (
          SELECT COUNT(*)::int FROM sponsorships sp 
          JOIN beneficiaries b ON b.id = sp.beneficiary_id
          WHERE sp.sponsor_cluster_id = sr.sponsor_cluster_id
            AND sp.sponsor_specific_id = sr.sponsor_specific_id
            AND sp.status = 'active' AND b.type = 'child'
        ), 0) AS current_children,
        COALESCE( (
          SELECT COUNT(*)::int FROM sponsorships sp 
          JOIN beneficiaries b ON b.id = sp.beneficiary_id
          WHERE sp.sponsor_cluster_id = sr.sponsor_cluster_id
            AND sp.sponsor_specific_id = sr.sponsor_specific_id
            AND sp.status = 'active' AND b.type = 'elderly'
        ), 0) AS current_elders
      FROM sponsor_requests sr
      JOIN sponsors s
        ON s.cluster_id = sr.sponsor_cluster_id
       AND s.specific_id = sr.sponsor_specific_id
      ${whereClause}
      ORDER BY sr.created_at DESC
      LIMIT 500`;

    const [rows] = await sequelize.query(query, { bind: bindings });
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sponsor requests:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/sponsor_requests/:id to update status or fields
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const request = await SponsorRequest.findByPk(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    await request.update({ ...updates, reviewed_at: new Date() });
    res.json({ message: 'Sponsor request updated', request });
  } catch (error) {
    console.error('Error updating sponsor request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/sponsor_requests to create a new request
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const created = await SponsorRequest.create(data);
    res.status(201).json({ message: 'Sponsor request created', request: created });
  } catch (error) {
    console.error('Error creating sponsor request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/sponsor_requests/:id/approve to approve and create sponsor if needed
router.post('/:id/approve', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { cluster_id, specific_id, type, full_name, is_diaspora, agreed_monthly_payment, reviewed_by } = req.body;

    const request = await SponsorRequest.findByPk(id, { transaction });
    if (!request) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Request not found' });
    }

    // Create or update sponsor
    const existing = await Sponsor.findOne({ where: { cluster_id, specific_id }, transaction });
    if (!existing) {
      await Sponsor.create({
        cluster_id,
        specific_id,
        type: type === 'private' ? 'individual' : 'organization',
        full_name,
        starting_date: new Date(),
        agreed_monthly_payment,
        emergency_contact_name: 'N/A',
        emergency_contact_phone: 'N/A',
        status: 'active',
        is_diaspora: !!is_diaspora,
        address_id: 1
      }, { transaction });
    }

    await request.update({ status: 'approved', reviewed_by, reviewed_at: new Date() }, { transaction });

    await transaction.commit();
    res.json({ message: 'Request approved' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error approving sponsor request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
