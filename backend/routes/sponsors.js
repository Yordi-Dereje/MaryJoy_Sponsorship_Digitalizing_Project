const express = require('express');
const { Sponsor, Address, Employee, PhoneNumber, Sponsorship, Beneficiary, sequelize, Sequelize } = require('../models');
const router = express.Router();

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

    // Find sponsors with basic filters (use correct association aliases)
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
