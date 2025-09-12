const express = require('express');
const { Sponsorship, Beneficiary, sequelize } = require('../models');
const router = express.Router();

// POST - Create sponsorship
router.post('/', async (req, res) => {
  try {
    const {
      sponsor_cluster_id,
      sponsor_specific_id,
      beneficiary_id,
      start_date,
      monthly_amount,
      status
    } = req.body;

    // Validate required fields
    if (!sponsor_cluster_id || !sponsor_specific_id || !beneficiary_id || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sponsorship = await Sponsorship.create({
      sponsor_cluster_id,
      sponsor_specific_id,
      beneficiary_id,
      start_date,
      monthly_amount: monthly_amount || 0,
      status: status || 'active'
    });

    // Update beneficiary status to active
    await Beneficiary.update(
      { status: 'active' },
      { where: { id: beneficiary_id } }
    );

    res.status(201).json({
      message: 'Sponsorship created successfully',
      sponsorship
    });

  } catch (error) {
    console.error('Error creating sponsorship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
