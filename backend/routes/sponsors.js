const express = require('express');
const { Sponsor, Address, Employee, PhoneNumber, Sponsorship, Beneficiary, sequelize, Sequelize } = require('../models');
const router = express.Router();

// GET all sponsors
router.get('/', async (req, res) => {
  try {
    const { search, type, residency, beneficiaryType, status } = req.query;
    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    
    console.log('Fetching sponsors with filters:', { search, type, residency, beneficiaryType });
    
    let query = `
      SELECT 
        s.*,
        a.country,
        a.region,
        a.sub_region,
        a.woreda,
        a.house_number,
        e.full_name as created_by_name,
        pn.primary_phone,
        COUNT(sp.id) as total_beneficiaries,
        COUNT(CASE WHEN sp.status = 'active' THEN 1 END) as active_beneficiaries,
        COUNT(CASE WHEN b.type = 'child' THEN 1 END) as children_count,
        COUNT(CASE WHEN b.type = 'elderly' THEN 1 END) as elders_count
      FROM sponsors s
      LEFT JOIN addresses a ON s.address_id = a.id
      LEFT JOIN employees e ON s.created_by = e.id
      LEFT JOIN phone_numbers pn ON (pn.sponsor_cluster_id = s.cluster_id AND pn.sponsor_specific_id = s.specific_id AND pn.entity_type = 'sponsor')
      LEFT JOIN sponsorships sp ON (sp.sponsor_cluster_id = s.cluster_id AND sp.sponsor_specific_id = s.specific_id)
      LEFT JOIN beneficiaries b ON sp.beneficiary_id = b.id
    `;

    const queryParams = [];
    let whereConditions = [];
    
    if (search && search.trim() !== '') {
      whereConditions.push(`(s.full_name ILIKE $${queryParams.length + 1} OR s.cluster_id ILIKE $${queryParams.length + 1} OR s.specific_id ILIKE $${queryParams.length + 1} OR pn.primary_phone ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }

    if (type && type !== 'all') {
      whereConditions.push(`s.type = $${queryParams.length + 1}`);
      queryParams.push(type === 'Private' ? 'individual' : 'organization');
    }

    if (residency && residency !== 'all') {
      whereConditions.push(`s.is_diaspora = $${queryParams.length + 1}`);
      queryParams.push(residency === 'Diaspora');
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` GROUP BY s.cluster_id, s.specific_id, a.id, e.id, pn.id
               ORDER BY s.created_at DESC LIMIT 100`;

    console.log('Executing sponsors query with params:', queryParams);
    const result = await sequelize.query(query, {
      replacements: queryParams,
      type: Sequelize.QueryTypes.SELECT
    });

    // Apply beneficiary type filter in JavaScript since it's complex
    let filteredResult = result;
    if (beneficiaryType && beneficiaryType !== 'all') {
      filteredResult = result.filter(sponsor => {
        switch (beneficiaryType) {
          case 'child':
            return sponsor.children_count > 0;
          case 'elder':
            return sponsor.elders_count > 0;
          case 'both':
            return sponsor.children_count > 0 && sponsor.elders_count > 0;
          default:
            return true;
        }
      });
    }

    // Format the response to match frontend expectations
    const sponsors = filteredResult.map(sponsor => ({
      id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
      name: sponsor.full_name,
      type: sponsor.type === 'individual' ? 'Private' : 'Organization',
      residency: sponsor.is_diaspora ? 'Diaspora' : 'Local',
      phone: sponsor.primary_phone || 'N/A',
      beneficiaryCount: {
        children: sponsor.children_count || 0,
        elders: sponsor.elders_count || 0
      },
      // Keep original fields for debugging
      cluster_id: sponsor.cluster_id,
      specific_id: sponsor.specific_id,
      full_name: sponsor.full_name,
      status: sponsor.status,
      is_diaspora: sponsor.is_diaspora,
      children_count: sponsor.children_count,
      elders_count: sponsor.elders_count
    }));

    res.json({
      sponsors,
      total: sponsors.length,
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
// GET sponsor by composite ID (cluster_id-specific_id)
router.get('/:cluster_id/:specific_id', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        a.country,
        a.region,
        a.sub_region,
        a.woreda,
        a.house_number,
        e.full_name as created_by_name,
        pn.primary_phone,
        pn.secondary_phone,
        pn.tertiary_phone,
        COUNT(sp.id) as total_beneficiaries,
        COUNT(CASE WHEN sp.status = 'active' THEN 1 END) as active_beneficiaries
      FROM sponsors s
      LEFT JOIN addresses a ON s.address_id = a.id
      LEFT JOIN employees e ON s.created_by = e.id
      LEFT JOIN phone_numbers pn ON (pn.sponsor_cluster_id = s.cluster_id AND pn.sponsor_specific_id = s.specific_id AND pn.entity_type = 'sponsor')
      LEFT JOIN sponsorships sp ON (sp.sponsor_cluster_id = s.cluster_id AND sp.sponsor_specific_id = s.specific_id)
      WHERE s.cluster_id = $1 AND s.specific_id = $2
      GROUP BY s.cluster_id, s.specific_id, a.id, e.id, pn.id
    `;

    const result = await sequelize.query(query, {
      replacements: [cluster_id, specific_id],
      type: Sequelize.QueryTypes.SELECT
    });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    const sponsor = result[0];
    const response = {
      id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
      cluster_id: sponsor.cluster_id,
      specific_id: sponsor.specific_id,
      type: sponsor.type,
      full_name: sponsor.full_name,
      date_of_birth: sponsor.date_of_birth,
      gender: sponsor.gender,
      profile_picture_url: sponsor.profile_picture_url,
      starting_date: sponsor.starting_date,
      agreed_monthly_payment: sponsor.agreed_monthly_payment,
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
        primary: sponsor.primary_phone,
        secondary: sponsor.secondary_phone,
        tertiary: sponsor.tertiary_phone
      },
      sponsor_id: sponsor.sponsor_id,
      consent_document_url: sponsor.consent_document_url,
      total_beneficiaries: sponsor.total_beneficiaries,
      active_beneficiaries: sponsor.active_beneficiaries,
      created_at: sponsor.created_at,
      updated_at: sponsor.updated_at
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new sponsor
router.post('/', async (req, res) => {
  try {
    const sponsorData = req.body;

    // Validate required fields
    if (!sponsorData.cluster_id || !sponsorData.specific_id || !sponsorData.full_name || !sponsorData.type) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    const sponsor = await Sponsor.create(sponsorData);

    res.status(201).json({
      message: 'Sponsor created successfully',
      sponsor
    });

  } catch (error) {
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

module.exports = router;
