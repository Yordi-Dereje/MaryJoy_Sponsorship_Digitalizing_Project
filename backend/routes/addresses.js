const express = require('express');
const { Address } = require('../models');
const router = express.Router();

// GET - All addresses
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.findAll({
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Create address
router.post('/', async (req, res) => {
  try {
    const { country, region, sub_region, woreda, house_number } = req.body;

    if (!country || !region) {
      return res.status(400).json({ error: 'Country and region are required' });
    }

    const address = await Address.create({
      country,
      region,
      sub_region,
      woreda,
      house_number
    });

    res.status(201).json({
      message: 'Address created successfully',
      address
    });

  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
