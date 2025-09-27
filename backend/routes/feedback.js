const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

// GET /api/feedbacks
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;

    let baseQuery = `
      SELECT 
        f.feedback_id AS id,
        TRIM(f.sponsor_cluster_id::text) || '-' || TRIM(f.sponsor_specific_id::text) AS sponsor_id,
        s.full_name AS sponsor_name,
        s.phone_number AS phone,
        TRIM(f.feedback_text) AS feedback,
        f.status,
        f.response_text AS response,
        e.full_name AS responded_by,
        f.created_at,
        f.updated_at
      FROM feedback f
      LEFT JOIN sponsors s ON s.cluster_id::integer = f.sponsor_cluster_id::integer 
        AND s.specific_id::integer = f.sponsor_specific_id::integer
      LEFT JOIN employees e ON e.id = f.employee_id
      WHERE 1=1
    `;

    const replacements = [];

    if (status && status !== 'all') {
      baseQuery += ` AND f.status = ?`;
      replacements.push(status === 'pending' ? 'not responded' : 'responded');
    }

    baseQuery += ` ORDER BY f.created_at DESC LIMIT 500`;

    console.log('Executing query:', baseQuery); // Debug log
    console.log('Replacements:', replacements); // Debug log

    const items = await sequelize.query(baseQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    console.log('Query results:', items); // Debug log

    // Apply search filter if needed
    let filteredItems = items;
    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      filteredItems = items.filter(r =>
        (r.sponsor_name || '').toLowerCase().includes(term) ||
        (r.sponsor_id || '').toLowerCase().includes(term) ||
        (r.feedback || '').toLowerCase().includes(term)
      );
    }

    // Map status for frontend
    const mappedItems = filteredItems.map(item => ({
      ...item,
      status: item.status === 'not responded' ? 'pending' : 'responded'
    }));

    res.json({ 
      success: true,
      feedbacks: mappedItems,
      count: mappedItems.length
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Alternative simpler version without JOINs if the above still fails
router.get('/simple', async (req, res) => {
  try {
    const simpleQuery = `
      SELECT 
        feedback_id as id,
        sponsor_cluster_id::text || '-' || sponsor_specific_id::text as sponsor_id,
        'Sponsor ' || sponsor_cluster_id::text || '-' || sponsor_specific_id::text as sponsor_name,
        'Not available' as phone,
        feedback_text as feedback,
        status,
        response_text as response,
        CASE WHEN response_text IS NOT NULL THEN 'Database Officer' ELSE '' END as responded_by,
        created_at,
        updated_at
      FROM feedback
      ORDER BY created_at DESC
      LIMIT 500
    `;

    const items = await sequelize.query(simpleQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    // Map status for frontend
    const mappedItems = items.map(item => ({
      ...item,
      status: item.status === 'not responded' ? 'pending' : 'responded'
    }));

    res.json({ 
      success: true,
      feedbacks: mappedItems,
      count: mappedItems.length
    });
  } catch (error) {
    console.error('Error fetching feedbacks (simple):', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// POST /api/feedbacks/:id/respond
router.post('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { response, responded_by } = req.body;

    if (!response || !responded_by) {
      return res.status(400).json({
        success: false,
        message: 'Response and responder name are required'
      });
    }

    // Try to find employee by provided name to attribute the response
    let employeeId = null;
    try {
      const employees = await sequelize.query(
        `SELECT id FROM employees WHERE full_name = ? LIMIT 1`,
        { replacements: [responded_by], type: sequelize.QueryTypes.SELECT }
      );
      if (employees && employees.length > 0) {
        employeeId = employees[0].id;
      }
    } catch (lookupErr) {
      console.warn('Warning: failed to lookup employee by name:', lookupErr.message);
    }

    if (employeeId !== null) {
      const updateQuery = `
        UPDATE feedback 
        SET 
          response_text = ?,
          status = 'responded',
          updated_at = CURRENT_TIMESTAMP,
          employee_id = COALESCE(?, employee_id)
        WHERE feedback_id = ?
      `;
      await sequelize.query(updateQuery, {
        replacements: [response, employeeId, id],
        type: sequelize.QueryTypes.UPDATE
      });
    } else {
      const updateQuery = `
        UPDATE feedback 
        SET 
          response_text = ?,
          status = 'responded',
          updated_at = CURRENT_TIMESTAMP
        WHERE feedback_id = ?
      `;
      await sequelize.query(updateQuery, {
        replacements: [response, id],
        type: sequelize.QueryTypes.UPDATE
      });
    }

    res.json({
      success: true,
      message: 'Response saved successfully'
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving response',
      error: error.message
    });
  }
});

// POST /api/feedbacks - Create new feedback
router.post('/', async (req, res) => {
  try {
    const { sponsor_cluster_id, sponsor_specific_id, feedback_text, employee_id = 1 } = req.body;

    if (!sponsor_cluster_id || !sponsor_specific_id || !feedback_text) {
      return res.status(400).json({
        success: false,
        message: 'Sponsor cluster ID, sponsor specific ID, and feedback text are required'
      });
    }

    const insertQuery = `
      INSERT INTO feedback (sponsor_cluster_id, sponsor_specific_id, feedback_text, employee_id, status)
      VALUES (?, ?, ?, ?, 'not responded')
      RETURNING feedback_id
    `;

    const [result] = await sequelize.query(insertQuery, {
      replacements: [sponsor_cluster_id, sponsor_specific_id, feedback_text, employee_id],
      type: sequelize.QueryTypes.INSERT
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: result[0].feedback_id
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// Debug route to check table structure
router.get('/debug', async (req, res) => {
  try {
    // Check feedback table structure
    const [feedbackColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'feedback' 
      ORDER BY ordinal_position
    `);

    // Check sponsors table structure
    const [sponsorColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'sponsors' 
      ORDER BY ordinal_position
    `);

    // Check sample data from feedback table
    const [sampleData] = await sequelize.query(`
      SELECT * FROM feedback LIMIT 5
    `);

    res.json({
      success: true,
      feedbackColumns,
      sponsorColumns,
      sampleData
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Data Diagnosis Route
router.get('/diagnose/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get the feedback record
    const feedback = await sequelize.query(
      `SELECT * FROM feedback WHERE feedback_id = ?`,
      { replacements: [id], type: sequelize.QueryTypes.SELECT }
    );

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    const feedbackRecord = feedback[0];
    const { sponsor_cluster_id, sponsor_specific_id } = feedbackRecord;

    // 2. Try to find the matching sponsor record
    const sponsor = await sequelize.query(
      `SELECT * FROM sponsors WHERE TRIM(cluster_id::text) = ? AND TRIM(specific_id::text) = ?`,
      { 
        replacements: [String(sponsor_cluster_id).trim(), String(sponsor_specific_id).trim()], 
        type: sequelize.QueryTypes.SELECT 
      }
    );

    res.json({
      success: true,
      message: 'Data diagnosis for Feedback ID: ' + id,
      feedback_record: {
        ...feedbackRecord,
        notes: `The system is looking for a sponsor with cluster_id='${sponsor_cluster_id}' and specific_id='${sponsor_specific_id}'.`
      },
      matching_sponsor_record: sponsor.length > 0 
        ? sponsor[0] 
        : {
            error: `No sponsor found matching cluster_id='${sponsor_cluster_id}' and specific_id='${sponsor_specific_id}'. Please check the sponsors table for this ID.`,
            data_in_sponsors_table: `Verify that a row exists in the 'sponsors' table where 'cluster_id' is '${sponsor_cluster_id}' and 'specific_id' is '${sponsor_specific_id}'. Check for typos or extra characters.`
          }
    });

  } catch (error) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
