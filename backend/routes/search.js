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
    let searchConditions = [];

    // Check if the query contains a formatted ID like "(ID: 02-1004)"
    const idMatch = query.match(/\(ID:\s*([^-]+)-([^\)]+)\)/);
    if (idMatch) {
      // Extract cluster_id and specific_id from the formatted string
      const clusterId = idMatch[1].trim();
      const specificId = idMatch[2].trim();

      // If we have a properly formatted ID, search by exact ID match first
      searchConditions.push({
        cluster_id: clusterId,
        specific_id: specificId
      });
    } else {
      // For regular search terms, search in multiple fields
      searchConditions.push(
        { full_name: { [Op.iLike]: `%${query}%` } },
        { phone_number: { [Op.iLike]: `%${query}%` } },
        { cluster_id: { [Op.iLike]: `%${query}%` } },
        { specific_id: { [Op.iLike]: `%${query}%` } }
      );
    }

    const sponsors = await sequelize.models.Sponsor.findAll({
      where: {
        [Op.or]: searchConditions,
      },
      limit: 10,
    });

    // Transform the response to include the formatted ID for frontend compatibility
    const transformedSponsors = sponsors.map(sponsor => ({
      id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
      cluster_id: sponsor.cluster_id,
      specific_id: sponsor.specific_id,
      full_name: sponsor.full_name,
      phone_number: sponsor.phone_number,
      type: sponsor.type,
      status: sponsor.status
    }));

    res.json(transformedSponsors);
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
    // Use raw SQL query to properly join guardians with their phone numbers
    const guardians = await sequelize.query(`
      SELECT DISTINCT
        g.id,
        g.full_name,
        g.relation_to_beneficiary,
        g.address_id,
        g.created_at,
        g.updated_at,
        pn.primary_phone,
        pn.secondary_phone,
        pn.tertiary_phone
      FROM guardians g
      LEFT JOIN phone_numbers pn ON pn.guardian_id = g.id AND pn.entity_type = 'guardian'
      WHERE
        g.full_name ILIKE :query OR
        pn.primary_phone ILIKE :query OR
        pn.secondary_phone ILIKE :query OR
        pn.tertiary_phone ILIKE :query
      LIMIT 10
    `, {
      replacements: { query: `%${query}%` },
      type: sequelize.QueryTypes.SELECT
    });

    res.json(guardians);
  } catch (error) {
    console.error('Error searching guardians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
