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
      status,
      created_by
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
      status: status || 'active',
      created_by
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

// DELETE - Remove all sponsorships for a sponsor (used when deactivating sponsor)
router.delete('/sponsor/:cluster_id/:specific_id', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;

    // Delete all sponsorships for this sponsor
    const deletedCount = await Sponsorship.destroy({
      where: {
        sponsor_cluster_id: cluster_id,
        sponsor_specific_id: specific_id
      }
    });

    res.status(200).json({
      message: 'Sponsorship relationships removed successfully',
      deletedCount
    });

  } catch (error) {
    console.error('Error removing sponsorships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
