const express = require('express');
const { 
  sequelize, 
  Beneficiary, 
  Guardian, 
  Sponsorship, 
  Sponsor, 
  Address, 
  PhoneNumber, 
  BankInformation, 
  Sequelize 
} = require('../models');
const { authenticateToken, requireRole } = require('./auth');
const router = express.Router();

// =======================
// GET all child beneficiaries
// =======================
router.get('/children', async (req, res) => {
  try {
    const { status } = req.query;

    let statusFilter = status ? `AND b.status = '${status}'` : '';

    const query = `
      SELECT 
        b.id,
        b.full_name as child_name,
        b.date_of_birth,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age,
        b.gender,
        b.status,
        g.full_name as guardian_name,
        g.id as guardian_id,
        s.sponsor_cluster_id || '-' || s.sponsor_specific_id as "sponsorId",
        pn.primary_phone as phone
      FROM beneficiaries b
      LEFT JOIN guardians g ON b.guardian_id = g.id
      LEFT JOIN sponsorships s ON b.id = s.beneficiary_id AND s.status = 'active'
      LEFT JOIN phone_numbers pn ON (
        (pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary') OR
        (pn.guardian_id = g.id AND pn.entity_type = 'guardian')
      )
      WHERE b.type = 'child' ${statusFilter}
    `;

    const beneficiaries = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    // Add children count per guardian
    const guardianIds = [...new Set(beneficiaries.map(b => b.guardian_id).filter(Boolean))];
    let guardianCounts = {};
    if (guardianIds.length > 0) {
      const countQuery = `
        SELECT g.id, COUNT(b.id) as child_count
        FROM guardians g
        LEFT JOIN beneficiaries b ON g.id = b.guardian_id AND b.type = 'child' AND b.status = 'active'
        WHERE g.id IN (?)
        GROUP BY g.id
      `;
      const countResult = await sequelize.query(countQuery, {
        replacements: [guardianIds],
        type: Sequelize.QueryTypes.SELECT
      });
      countResult.forEach(row => {
        guardianCounts[row.id] = row.child_count;
      });
    }

    const result = beneficiaries.map(b => ({
      id: b.id,
      child_name: b.child_name,
      age: b.age,
      gender: b.gender,
      guardian_name: b.guardian_name,
      phone: b.phone || 'N/A',
      sponsorId: b.sponsorId || 'N/A',
      childrenCount: b.guardian_id ? (guardianCounts[b.guardian_id] || 1) : 0,
      status: b.status
    }));

    res.json({ beneficiaries: result, total: result.length });

  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =======================
// GET child beneficiary by ID
// =======================
router.get('/children/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        b.*,
        g.full_name as guardian_name,
        g.relation_to_beneficiary as guardian_relationship,
        a.country, a.region, a.sub_region, a.woreda, a.house_number,
        pn.primary_phone as guardian_phone, pn.secondary_phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age
      FROM beneficiaries b
      LEFT JOIN guardians g ON b.guardian_id = g.id
      LEFT JOIN addresses a ON g.address_id = a.id
      LEFT JOIN phone_numbers pn ON pn.guardian_id = g.id AND pn.entity_type = 'guardian'
      WHERE b.id = ? AND b.type = 'child'
    `;

    const [beneficiary] = await sequelize.query(query, {
      replacements: [id],
      type: Sequelize.QueryTypes.SELECT
    });

    if (!beneficiary) return res.status(404).json({ error: 'Child beneficiary not found' });

    const response = {
      ...beneficiary,
      guardian: beneficiary.guardian_name ? {
        full_name: beneficiary.guardian_name,
        relationship: beneficiary.guardian_relationship || 'parent',
        phone: beneficiary.guardian_phone || null,
        email: null
      } : null,
      address: {
        country: beneficiary.country,
        region: beneficiary.region,
        sub_region: beneficiary.sub_region,
        woreda: beneficiary.woreda,
        house_number: beneficiary.house_number
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching child beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =======================
// GET all elderly beneficiaries
// =======================
router.get('/elderly', async (req, res) => {
  try {
    const { status } = req.query;

    let statusFilter = status ? `AND b.status = '${status}'` : '';

    const query = `
      SELECT
        b.id,
        b.full_name,
        b.date_of_birth,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age,
        b.gender,
        b.status,
        s.sponsor_cluster_id || '-' || s.sponsor_specific_id as "sponsorId",
        pn.primary_phone as phone
      FROM beneficiaries b
      LEFT JOIN sponsorships s ON b.id = s.beneficiary_id AND s.status = 'active'
      LEFT JOIN phone_numbers pn ON pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary'
      WHERE b.type = 'elderly' ${statusFilter}
    `;

    const beneficiaries = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });

    const result = beneficiaries.map(elderly => ({
      id: elderly.id,
      elderlyName: elderly.full_name,
      age: elderly.age,
      gender: elderly.gender,
      phone: elderly.phone || 'N/A',
      sponsorId: elderly.sponsorId || 'N/A',
      sponsorName: 'Unassigned',
      status: elderly.status
    }));

    res.json({ beneficiaries: result, total: result.length });

  } catch (error) {
    console.error('Error fetching elderly beneficiaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =======================
// GET elderly beneficiary by ID
// =======================
router.get('/elderly/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        b.*,
        s.sponsor_cluster_id,
        s.sponsor_specific_id,
        s.full_name as sponsor_name,
        a.country, a.region, a.sub_region, a.woreda, a.house_number,
        pn.primary_phone as phone, pn.secondary_phone, pn.tertiary_phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age
      FROM beneficiaries b
      LEFT JOIN sponsorships sp ON b.id = sp.beneficiary_id
      LEFT JOIN sponsors s ON sp.sponsor_id = s.id
      LEFT JOIN addresses a ON b.address_id = a.id
      LEFT JOIN phone_numbers pn ON pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary'
      WHERE b.id = ? AND b.type = 'elderly'
    `;

    const [elderly] = await sequelize.query(query, {
      replacements: [id],
      type: Sequelize.QueryTypes.SELECT
    });

    if (!elderly) return res.status(404).json({ error: 'Elderly beneficiary not found' });

    const response = {
      id: elderly.id,
      elderlyName: elderly.full_name,
      age: elderly.age,
      gender: elderly.gender,
      phone: elderly.phone || 'N/A',
      phone2: elderly.secondary_phone || null,
      phone3: elderly.tertiary_phone || null,
      sponsorId: elderly.sponsor_cluster_id ? `${elderly.sponsor_cluster_id}-${elderly.sponsor_specific_id}` : 'N/A',
      sponsorName: elderly.sponsor_name || 'Unassigned',
      status: elderly.status,
      address: {
        country: elderly.country,
        region: elderly.region,
        sub_region: elderly.sub_region,
        woreda: elderly.woreda,
        house_number: elderly.house_number
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching elderly beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =======================
// SEARCH guardians
// =======================
router.get('/guardians/search', async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = search ? {
      [Sequelize.Op.or]: [
        { full_name: { [Sequelize.Op.iLike]: `%${search}%` } },
        { '$phone_numbers.primary_phone$': { [Sequelize.Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const guardians = await Guardian.findAll({
      where: whereClause,
      include: [{
        model: PhoneNumber,
        as: 'phone_numbers',
        where: { entity_type: 'guardian' },
        required: false
      }],
      limit: 10
    });

    res.json({
      guardians: guardians.map(g => ({
        id: g.id,
        name: g.full_name,
        phone: g.phone_numbers?.[0]?.primary_phone || 'No phone'
      })),
      total: guardians.length
    });

  } catch (error) {
    console.error('Error searching guardians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =======================
// Export router
// =======================
module.exports = router;
