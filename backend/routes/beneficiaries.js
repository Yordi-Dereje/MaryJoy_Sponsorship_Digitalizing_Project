const express = require('express');
const { sequelize, Beneficiary, Guardian, Sponsorship, Sponsor, Address, PhoneNumber, Sequelize } = require('../models');
const router = express.Router();

// GET all child beneficiaries with guardian and sponsor information
router.get('/children', async (req, res) => {
  try {
    const { search } = req.query;
    
    console.log('Fetching child beneficiaries with search:', search);
    
    let query = `
      SELECT 
        b.id,
        b.full_name as child_name,
        b.date_of_birth,
        b.gender,
        b.status,
        b.support_letter_url,
        b.created_at,
        g.full_name as guardian_name,
        g.relation_to_beneficiary,
        g.id as guardian_id,
        s.cluster_id,
        s.specific_id,
        s.full_name as sponsor_name,
        pn.primary_phone as guardian_phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age,
        sp.status as sponsorship_status
      FROM beneficiaries b
      LEFT JOIN guardians g ON b.guardian_id = g.id
      LEFT JOIN sponsorships sp ON b.id = sp.beneficiary_id AND sp.status = 'active'
      LEFT JOIN sponsors s ON sp.sponsor_cluster_id = s.cluster_id AND sp.sponsor_specific_id = s.specific_id
      LEFT JOIN phone_numbers pn ON pn.guardian_id = g.id AND pn.entity_type = 'guardian'
      WHERE b.type = 'child'
      AND b.status = 'active'
    `;

    const queryParams = [];
    
    if (search && search.trim() !== '') {
      query += ` AND (b.full_name ILIKE ? OR g.full_name ILIKE ? OR s.cluster_id ILIKE ? OR pn.primary_phone ILIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY b.created_at DESC LIMIT 100`;

    console.log('Executing query with params:', queryParams);
    const result = await sequelize.query(query, {
      replacements: queryParams,
      type: Sequelize.QueryTypes.SELECT
    });
    
    // Calculate children count per guardian
    const childrenWithCounts = await calculateChildrenCounts(result);

    res.json({
      beneficiaries: childrenWithCounts,
      total: result.length,
      message: 'Children fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching child beneficiaries:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Helper function to calculate children counts
async function calculateChildrenCounts(beneficiaries) {
  try {
    if (beneficiaries.length === 0) return [];
    
    const guardianIds = [...new Set(beneficiaries.map(b => b.guardian_id).filter(id => id))];
    
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
      
      // Create a map of guardian ids to child counts
      const guardianCounts = {};
      countResult.forEach(row => {
        guardianCounts[row.id] = row.child_count;
      });

      // Add childrenCount to each beneficiary
      return beneficiaries.map(beneficiary => ({
        id: beneficiary.id,
        child_name: beneficiary.child_name,
        age: beneficiary.age,
        gender: beneficiary.gender,
        guardian_name: beneficiary.guardian_name,
        phone: beneficiary.guardian_phone || 'N/A',
        sponsorId: beneficiary.cluster_id ? `${beneficiary.cluster_id}-${beneficiary.specific_id}` : 'N/A',
        childrenCount: beneficiary.guardian_id ? (guardianCounts[beneficiary.guardian_id] || 1) : 0,
        status: beneficiary.status,
        support_letter_url: beneficiary.support_letter_url,
        created_at: beneficiary.created_at
      }));
    }
    
    // Return beneficiaries without counts if no guardian ids
    return beneficiaries.map(beneficiary => ({
      id: beneficiary.id,
      child_name: beneficiary.child_name,
      age: beneficiary.age,
      gender: beneficiary.gender,
      guardian_name: beneficiary.guardian_name,
      phone: beneficiary.guardian_phone || 'N/A',
      sponsorId: beneficiary.cluster_id ? `${beneficiary.cluster_id}-${beneficiary.specific_id}` : 'N/A',
      childrenCount: 1, // Default value
      status: beneficiary.status,
      support_letter_url: beneficiary.support_letter_url,
      created_at: beneficiary.created_at
    }));
    
  } catch (error) {
    console.error('Error calculating children counts:', error);
    // Return beneficiaries without counts if there's an error
    return beneficiaries.map(beneficiary => ({
      id: beneficiary.id,
      child_name: beneficiary.child_name,
      age: beneficiary.age,
      gender: beneficiary.gender,
      guardian_name: beneficiary.guardian_name,
      phone: beneficiary.guardian_phone || 'N/A',
      sponsorId: beneficiary.cluster_id ? `${beneficiary.cluster_id}-${beneficiary.specific_id}` : 'N/A',
      childrenCount: 1, // Default value
      status: beneficiary.status,
      support_letter_url: beneficiary.support_letter_url,
      created_at: beneficiary.created_at
    }));
  }
}

// GET child beneficiary by ID
router.get('/children/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        b.*,
        g.full_name as guardian_name,
        g.relation_to_beneficiary,
        a.country,
        a.region,
        a.sub_region,
        a.woreda,
        a.house_number,
        pn.primary_phone as guardian_phone,
        pn.secondary_phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age
      FROM beneficiaries b
      LEFT JOIN guardians g ON b.guardian_id = g.id
      LEFT JOIN addresses a ON g.address_id = a.id
      LEFT JOIN phone_numbers pn ON pn.guardian_id = g.id AND pn.entity_type = 'guardian'
      WHERE b.id = ? AND b.type = 'child'
    `;

    const result = await sequelize.query(query, {
      replacements: [id],
      type: Sequelize.QueryTypes.SELECT
    });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Child beneficiary not found' });
    }

    res.json(result[0]);

  } catch (error) {
    console.error('Error fetching child beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all elderly beneficiaries with sponsor information
router.get('/elderly', async (req, res) => {
  try {
    const { search } = req.query;
    
    console.log('Fetching elderly beneficiaries...');
    
    let query = `
      SELECT 
        b.id,
        b.full_name as elderly_name,
        b.date_of_birth,
        b.gender,
        b.status,
        b.support_letter_url,
        b.created_at,
        s.cluster_id,
        s.specific_id,
        s.full_name as sponsor_name,
        a.country,
        a.region,
        a.sub_region,
        a.woreda,
        a.house_number,
        pn.primary_phone as phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age,
        sp.status as sponsorship_status
      FROM beneficiaries b
      LEFT JOIN sponsorships sp ON b.id = sp.beneficiary_id AND sp.status = 'active'
      LEFT JOIN sponsors s ON sp.sponsor_cluster_id = s.cluster_id AND sp.sponsor_specific_id = s.specific_id
      LEFT JOIN addresses a ON b.address_id = a.id
      LEFT JOIN phone_numbers pn ON pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary'
      WHERE b.type = 'elderly'
      AND b.status = 'active'
    `;

    const queryParams = [];
    
    if (search && search.trim() !== '') {
      query += ` AND (b.full_name ILIKE ? OR s.cluster_id ILIKE ? OR s.specific_id ILIKE ? OR pn.primary_phone ILIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY b.id, b.created_at DESC LIMIT 100`;

    console.log('Executing elderly query with params:', queryParams);
    const result = await sequelize.query(query, {
      replacements: queryParams,
      type: Sequelize.QueryTypes.SELECT
    });
    
    const elderlyWithSponsorIds = result.map(elderly => ({
      id: elderly.id,
      elderlyName: elderly.elderly_name,
      age: elderly.age,
      gender: elderly.gender,
      phone: elderly.phone || 'N/A',
      sponsorId: elderly.cluster_id ? `${elderly.cluster_id}-${elderly.specific_id}` : 'N/A',
      sponsorName: elderly.sponsor_name || 'Unassigned',
      status: elderly.status,
      dateOfBirth: elderly.date_of_birth,
      support_letter_url: elderly.support_letter_url,
      address: {
        country: elderly.country,
        region: elderly.region,
        sub_region: elderly.sub_region,
        woreda: elderly.woreda,
        house_number: elderly.house_number
      },
      createdAt: elderly.created_at
    }));

    res.json({
      beneficiaries: elderlyWithSponsorIds,
      total: result.length,
      message: 'Elderly beneficiaries fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching elderly beneficiaries:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET elderly beneficiary by ID
router.get('/elderly/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        b.*,
        s.cluster_id,
        s.specific_id,
        s.full_name as sponsor_name,
        a.country,
        a.region,
        a.sub_region,
        a.woreda,
        a.house_number,
        pn.primary_phone as phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age
      FROM beneficiaries b
      LEFT JOIN sponsorships sp ON b.id = sp.beneficiary_id
      LEFT JOIN sponsors s ON sp.sponsor_cluster_id = s.cluster_id AND sp.sponsor_specific_id = s.specific_id
      LEFT JOIN addresses a ON b.address_id = a.id
      LEFT JOIN phone_numbers pn ON pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary'
      WHERE b.id = ? AND b.type = 'elderly'
    `;

    const result = await sequelize.query(query, {
      replacements: [id],
      type: Sequelize.QueryTypes.SELECT
    });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Elderly beneficiary not found' });
    }

    const elderly = result[0];
    const response = {
      id: elderly.id,
      elderlyName: elderly.full_name,
      age: elderly.age,
      gender: elderly.gender,
      phone: elderly.phone || 'N/A',
      sponsorId: elderly.cluster_id ? `${elderly.cluster_id}-${elderly.specific_id}` : 'N/A',
      sponsorName: elderly.sponsor_name || 'Unassigned',
      status: elderly.status,
      dateOfBirth: elderly.date_of_birth,
      support_letter_url: elderly.support_letter_url,
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

// CREATE new beneficiary
router.post('/', async (req, res) => {
  try {
    const { 
      type, full_name, date_of_birth, gender, status, 
      guardian_id, address_id, support_letter_url
    } = req.body;

    // Validate required fields
    if (!type || !full_name || !date_of_birth || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const beneficiary = await Beneficiary.create({
      type,
      full_name,
      date_of_birth,
      gender,
      status: status || 'waiting_list',
      guardian_id,
      address_id,
      support_letter_url
    });

    res.status(201).json({
      message: 'Beneficiary created successfully',
      beneficiary
    });

  } catch (error) {
    console.error('Error creating beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE beneficiary
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const beneficiary = await Beneficiary.findByPk(id);
    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    await beneficiary.update(updates);

    res.json({
      message: 'Beneficiary updated successfully',
      beneficiary
    });

  } catch (error) {
    console.error('Error updating beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE beneficiary
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const beneficiary = await Beneficiary.findByPk(id);
    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    await beneficiary.destroy();

    res.json({ message: 'Beneficiary deleted successfully' });

  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Filter beneficiaries by status
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    const beneficiaries = await Beneficiary.findAll({
      where: whereClause,
      attributes: ['id', 'type', 'full_name', 'status', 'created_at']
    });

    res.json({
      beneficiaries,
      total: beneficiaries.length,
      message: 'Beneficiaries fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET waiting list beneficiaries
router.get('/waiting', async (req, res) => {
  try {
    const query = `
      SELECT 
        b.*,
        g.full_name as guardian_name,
        pn.primary_phone as phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age
      FROM beneficiaries b
      LEFT JOIN guardians g ON b.guardian_id = g.id
      LEFT JOIN phone_numbers pn ON (
        (pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary') OR
        (pn.guardian_id = g.id AND pn.entity_type = 'guardian')
      )
      WHERE b.status IN ('waiting_list', 'pending_reassignment')
      AND NOT EXISTS (
        SELECT 1 FROM sponsorships sp 
        WHERE sp.beneficiary_id = b.id AND sp.status = 'active'
      )
    `;

    const result = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    res.json({
      beneficiaries: result,
      total: result.length
    });

  } catch (error) {
    console.error('Error fetching waiting list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Search guardians
router.get('/guardians/search', async (req, res) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search && search.trim() !== '') {
      whereClause = {
        [Sequelize.Op.or]: [
          { full_name: { [Sequelize.Op.iLike]: `%${search}%` } },
          { '$phone_numbers.primary_phone$': { [Sequelize.Op.iLike]: `%${search}%` } }
        ]
      };
    }

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
      guardians: guardians.map(guardian => ({
        id: guardian.id,
        name: guardian.full_name,
        phone: guardian.phone_numbers?.[0]?.primary_phone || 'No phone'
      })),
      total: guardians.length
    });

  } catch (error) {
    console.error('Error searching guardians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
