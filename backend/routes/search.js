const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { Op } = require('sequelize');

// Search for sponsors
router.get('/sponsors', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json([]);
  }

  try {
    const sponsors = await sequelize.models.Sponsor.findAll({
      where: {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${query}%` } },
          { phone_number: { [Op.iLike]: `%${query}%` } },
          { cluster_id: { [Op.iLike]: `%${query}%` } },
          { specific_id: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 10,
    });
    res.json(sponsors);
  } catch (error) {
    console.error('Error searching sponsors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search for guardians
router.get('/guardians', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json([]);
  }

  try {
    const guardians = await sequelize.models.Guardian.findAll({
      where: {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${query}%` } },
          { '$phoneNumbers.primary_phone$': { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: {
        model: sequelize.models.PhoneNumber,
        as: 'phoneNumbers',
        attributes: [], // We only need it for the JOIN, not in the final output
        required: false,
      },
      limit: 10,
    });
    res.json(guardians);
  } catch (error) {
    console.error('Error searching guardians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
