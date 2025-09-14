const express = require('express');
const { sequelize, Beneficiary, Guardian, Sponsorship, Sponsor, Address, PhoneNumber, Sequelize } = require('../models');
const router = express.Router();


// GET all child beneficiaries with guardian and sponsor information
router.get('/children', async (req, res) => {
  try {
    const { search, status } = req.query;
    
    console.log('Fetching children beneficiaries...');
    
    let statusFilter = "";
    if (status) {
      statusFilter = `AND b.status = '${status}'`;
    }

    let query = `
      SELECT 
        b.id,
        b.full_name as child_name,
        b.date_of_birth,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age,
        b.gender,
        b.status,
        g.full_name as guardian_name,
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
    
    const result = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    res.json({
      beneficiaries: result,
      total: result.length
    });

  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Internal server error' });
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
        phone: beneficiary.phone || 'N/A',
        sponsorId: beneficiary.sponsorId || 'N/A',
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
      phone: beneficiary.phone || 'N/A',
      sponsorId: beneficiary.sponsorId || 'N/A',
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
      phone: beneficiary.phone || 'N/A',
      sponsorId: beneficiary.sponsorId || 'N/A',
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
    const { search, status } = req.query;
    
    console.log('Fetching elderly beneficiaries...');
    
    let statusFilter = "";
    if (status) {
      statusFilter = `AND b.status = '${status}'`;
    }

    let query = `
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

    const result = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    const elderlyWithSponsorIds = result.map(elderly => ({
      id: elderly.id,
      elderlyName: elderly.full_name,
      age: elderly.age,
      gender: elderly.gender,
      phone: elderly.phone || 'N/A',
      sponsorId: elderly.sponsorId || 'N/A',
      sponsorName: 'Unassigned',
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
        s.sponsor_cluster_id,
        s.sponsor_specific_id,
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
      LEFT JOIN sponsors s ON sp.sponsor_id = s.id
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
      sponsorId: elderly.sponsor_cluster_id ? `${elderly.sponsor_cluster_id}-${elderly.sponsor_specific_id}` : 'N/A',
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

// CREATE new child beneficiary
router.post('/children', async (req, res) => {
  try {
    const { 
      full_name, date_of_birth, gender, status, 
      guardian_id, address_id, support_letter_url, photo_url
    } = req.body;

    // Validate required fields
    if (!full_name || !date_of_birth || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const beneficiary = await Beneficiary.create({
      type: 'child',
      full_name,
      date_of_birth,
      gender,
      status: status || 'waiting_list',
      guardian_id,
      address_id,
      support_letter_url,
      photo_url
    });

    res.status(201).json({
      message: 'Child beneficiary created successfully',
      beneficiary
    });

  } catch (error) {
    console.error('Error creating child beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new elderly beneficiary
router.post('/elderly', async (req, res) => {
  try {
    const { 
      full_name, date_of_birth, gender, status, 
      address_id, support_letter_url, consent_document_url
    } = req.body;

    // Validate required fields
    if (!full_name || !date_of_birth || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const beneficiary = await Beneficiary.create({
      type: 'elderly',
      full_name,
      date_of_birth,
      gender,
      status: status || 'waiting_list',
      guardian_id: null, // Elderly beneficiaries don't have guardians
      address_id,
      support_letter_url,
      consent_document_url
    });

    res.status(201).json({
      message: 'Elderly beneficiary created successfully',
      beneficiary
    });

  } catch (error) {
    console.error('Error creating elderly beneficiary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new beneficiary (general)
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

// GET all beneficiaries with filtering and search
router.get('/', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let whereClause = {};
    let includeClause = [
      {
        model: Guardian,
        as: 'guardian',
        attributes: ['full_name'],
        required: false
      },
      {
        model: PhoneNumber,
        as: 'phoneNumbers',
        attributes: ['primary_phone'],
        where: { entity_type: 'beneficiary' },
        required: false
      }
    ];

    if (status) whereClause.status = status;
    if (type && type !== 'all') whereClause.type = type;

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      whereClause[Sequelize.Op.or] = [
        { full_name: { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
        { '$guardian.full_name$': { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
        { '$phoneNumbers.primary_phone$': { [Sequelize.Op.iLike]: `%${searchTerm}%` } }
      ];
    }

    const beneficiaries = await Beneficiary.findAll({
      where: whereClause,
      include: includeClause,
      attributes: [
        'id', 
        'type', 
        'full_name', 
        'status', 
        'created_at',
        'date_of_birth',
        [sequelize.literal('EXTRACT(YEAR FROM AGE(CURRENT_DATE, "Beneficiary".date_of_birth))'), 'age']
      ],
      order: [['created_at', 'DESC']],
      distinct: true,
      subQuery: false
    });

    const result = beneficiaries.map(b => ({
      id: b.id,
      type: b.type,
      full_name: b.full_name,
      status: b.status,
      created_at: b.created_at,
      age: b.get('age'),
      guardian_name: b.guardian ? b.guardian.full_name : null,
      phone: b.phoneNumbers && b.phoneNumbers.length > 0 ? b.phoneNumbers[0].primary_phone : null
    }));

    res.json({
      beneficiaries: result,
      total: result.length,
      message: 'Beneficiaries fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET all beneficiaries on the waiting list
router.get('/waiting', async (req, res) => {
  try {
    console.log('Fetching waiting list beneficiaries...');

    const query = `
      SELECT 
        b.id,
        b.full_name,
        b.type,
        b.date_of_birth,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) as age,
        b.gender,
        b.status,
        b.created_at,
        g.full_name as guardian_name,
        pn.primary_phone as phone
      FROM beneficiaries b
      LEFT JOIN guardians g ON b.guardian_id = g.id
      LEFT JOIN phone_numbers pn ON (
        (pn.beneficiary_id = b.id AND pn.entity_type = 'beneficiary') OR
        (pn.guardian_id = g.id AND pn.entity_type = 'guardian')
      )
      WHERE b.status = 'waiting'
      ORDER BY b.created_at ASC
    `;

    const beneficiaries = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    res.json({
      beneficiaries: beneficiaries.map(b => ({
        id: b.id,
        name: b.full_name,
        type: b.type,
        age: b.age,
        gender: b.gender,
        guardian: b.guardian_name,
        phone: b.phone || 'N/A',
        status: b.status,
        date_added: b.created_at
      })),
      total: beneficiaries.length
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

// Add this temporary debug route to your beneficiaries.js file
router.get('/debug/models', async (req, res) => {
  try {
    // Check what associations exist for each model
    const models = {
      Beneficiary: Object.keys(Beneficiary.associations || {}),
      Guardian: Object.keys(Guardian.associations || {}),
      Sponsor: Object.keys(Sponsor.associations || {}),
      Sponsorship: Object.keys(Sponsorship.associations || {})
    };
    
    res.json({
      models,
      message: 'Model associations retrieved successfully'
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
