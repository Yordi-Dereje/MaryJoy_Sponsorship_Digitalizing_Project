const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// POST - Create new document record
router.post('/', async (req, res) => {
  try {
    const {
      title,
      type,
      file_url,
      sponsor_cluster_id,
      sponsor_specific_id,
      guardian_id,
      beneficiary_id,
      created_by
    } = req.body;

    console.log('📤 Creating document record:', req.body);

    const document = await Document.create({
      title,
      type,
      file_url,
      sponsor_cluster_id,
      sponsor_specific_id,
      guardian_id,
      beneficiary_id,
      created_by
    });

    console.log('✅ Document record created:', document.id);
    res.status(201).json(document);
  } catch (error) {
    console.error('❌ Error creating document:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Get all documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      total: documents.length,
      documents: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Get all documents for a sponsor
router.get('/sponsor/:cluster_id/:specific_id', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;

    const documents = await Document.findAll({
      where: {
        sponsor_cluster_id: cluster_id,
        sponsor_specific_id: specific_id
      },
      order: [['created_at', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Get all documents for a beneficiary
router.get('/beneficiary/:beneficiary_id', async (req, res) => {
  try {
    const { beneficiary_id } = req.params;

    const documents = await Document.findAll({
      where: {
        beneficiary_id
      },
      order: [['created_at', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
