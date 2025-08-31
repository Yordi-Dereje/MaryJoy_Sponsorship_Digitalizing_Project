const express = require('express');
const { sequelize, Beneficiary, Guardian, Sponsorship, Sponsor, Address, PhoneNumber, Sequelize } = require('../models');
const router = express.Router();

// GET all child beneficiaries with guardian and sponsor information
router.get('/children', async (req, res) => {
  try {
    const { search } = req.query;
    
    console.log('Fetching child beneficiaries with search:', search);
    
    // Use raw SQL query for now to avoid composite key issues
    let query = `
      SELECT 
        b.id,
        b.full_name as child_name,
        b.date_of_birth,
        b.gender,
        b.status,
        b.photo_url,
        b.created_at,
        g.full_name as guardian_name,
        g.relation_to_beneficiary,
        s.cluster_id,
        s.specific_id,
        s.full_name as sponsor_name,
        pn.primary_phone as guardian_phone,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age
      FROM beneficiaries b
      LEFT JOIN guardians g ON b.guardian_id = g.id
      LEFT JOIN sponsorships sp ON b.id = sp.beneficiary_id
      LEFT JOIN sponsors s ON sp.sponsor_cluster_id = s.cluster_id AND sp.sponsor_specific_id = s.specific_id
      LEFT JOIN phone_numbers pn ON pn.guardian_id = g.id AND pn.entity_type = 'guardian'
      WHERE b.type = 'child'
      AND sp.status = 'active'
    `;

    const queryParams = [];
    
    if (search && search.trim() !== '') {
      query += ` AND (b.full_name ILIKE $1 OR g.full_name ILIKE $1 OR s.cluster_id ILIKE $1 OR pn.primary_phone ILIKE $1)`;
      queryParams.push(`%${search}%`);
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
    
    const guardianCounts = {};
    const guardianNames = [...new Set(beneficiaries.map(b => b.guardian_name).filter(name => name))];
    
    if (guardianNames.length > 0) {
      const countQuery = `
        SELECT g.full_name, COUNT(b.id) as child_count
        FROM guardians g
        LEFT JOIN beneficiaries b ON g.id = b.guardian_id AND b.type = 'child'
        WHERE g.full_name = ANY($1)
        GROUP BY g.full_name
      `;
      
      const countResult = await sequelize.query(countQuery, {
        replacements: [guardianNames],
        type: Sequelize.QueryTypes.SELECT
      });
      
      // Create a map of guardian names to child counts
      countResult.forEach(row => {
        guardianCounts[row.full_name] = row.child_count;
      });
    }

    // Add childrenCount to each beneficiary
    return beneficiaries.map(beneficiary => ({
      id: beneficiary.id,
      child_name: beneficiary.child_name,
      age: beneficiary.age,
      gender: beneficiary.gender,
      guardian_name: beneficiary.guardian_name,
      phone: beneficiary.guardian_phone || 'N/A',
      sponsorId: beneficiary.cluster_id ? `${beneficiary.cluster_id}-${beneficiary.specific_id}` : 'N/A',
      childrenCount: beneficiary.guardian_name ? (guardianCounts[beneficiary.guardian_name] || 1) : 0,
      status: beneficiary.status,
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
        g.bank_account_number,
        g.bank_name,
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
      WHERE b.id = $1 AND b.type = 'child'
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
      SELECT DISTINCT ON (b.id)
        b.id,
        b.full_name as elderly_name,
        b.date_of_birth,
        b.gender,
        b.status,
        b.photo_url,
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
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age
      FROM beneficiaries b
      LEFT JOIN sponsorships sp ON b.id = sp.beneficiary_id
      LEFT JOIN sponsors s ON sp.sponsor_cluster_id = s.cluster_id AND sp.sponsor_specific_id = s.specific_id
      LEFT JOIN addresses a ON b.address_id = a.id
      LEFT JOIN phone_numbers pn ON pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary'
      WHERE b.type = 'elderly'
      AND sp.status = 'active'
    `;

    const queryParams = [];
    
    if (search && search.trim() !== '') {
      query += ` AND (b.full_name ILIKE $1 OR s.cluster_id ILIKE $1 OR s.specific_id ILIKE $1 OR pn.primary_phone ILIKE $1)`;
      queryParams.push(`%${search}%`);
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
      address: {
        country: elderly.country,
        region: elderly.region,
        sub_region: elderly.sub_region,
        woreda: elderly.woreda,
        house_number: elderly.house_number
      },
      photoUrl: elderly.photo_url,
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
      WHERE b.id = $1 AND b.type = 'elderly'
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
      bankAccount: elderly.bank_account_number,
      bankName: elderly.bank_name,
      address: {
        country: elderly.country,
        region: elderly.region,
        sub_region: elderly.sub_region,
        woreda: elderly.woreda,
        house_number: elderly.house_number
      },
      photoUrl: elderly.photo_url
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching elderly beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to check database connection
router.get('/test', async (req, res) => {
  try {
    const currentTime = await sequelize.query('SELECT NOW() as current_time', { 
      type: Sequelize.QueryTypes.SELECT 
    });
    
    const beneficiaryCount = await Beneficiary.count();
    
    res.json({ 
      message: 'Database connection successful!',
      currentTime: currentTime[0].current_time,
      beneficiaryCount: beneficiaryCount
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// CREATE new beneficiary
router.post('/', async (req, res) => {
  try {
    const { 
      type, full_name, date_of_birth, gender, photo_url, status, 
      guardian_id, address_id, bank_account_number, bank_name 
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
      photo_url,
      status: status || 'pending',
      guardian_id,
      address_id,
      bank_account_number,
      bank_name
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

// Add this route for filtering by status
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

module.exports = router;
