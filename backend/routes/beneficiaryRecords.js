const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BeneficiaryRecord } = require('../models');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/beneficiary-records');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.body.beneficiary_id}-${req.body.type}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
    }
  }
});

// Create a new beneficiary record (graduation/termination)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { beneficiary_id, type, title, created_by } = req.body;

    // Validate required fields
    if (!beneficiary_id || !type || !title || !created_by) {
      return res.status(400).json({
        error: 'Missing required fields: beneficiary_id, type, title, created_by'
      });
    }

    // Validate type
    if (!['graduation', 'termination'].includes(type)) {
      return res.status(400).json({
        error: 'Type must be either "graduation" or "termination"'
      });
    }

    // Prepare record data
    const recordData = {
      beneficiary_id: parseInt(beneficiary_id),
      type,
      title: title.trim(),
      created_by: parseInt(created_by),
      file_url: req.file ? `/uploads/beneficiary-records/${req.file.filename}` : null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create the record
    const record = await BeneficiaryRecord.create(recordData);

    res.status(201).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} record created successfully`,
      record
    });

  } catch (error) {
    console.error('Error creating beneficiary record:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/beneficiary-records', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      error: 'Failed to create beneficiary record',
      details: error.message
    });
  }
});

// Get all records for a specific beneficiary
router.get('/beneficiary/:beneficiaryId', async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    const records = await BeneficiaryRecord.findAll({
      where: { beneficiary_id: beneficiaryId },
      order: [['created_at', 'DESC']]
    });

    res.json({
      records
    });

  } catch (error) {
    console.error('Error fetching beneficiary records:', error);
    res.status(500).json({
      error: 'Failed to fetch beneficiary records',
      details: error.message
    });
  }
});

// Get all records by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (!['graduation', 'termination'].includes(type)) {
      return res.status(400).json({
        error: 'Type must be either "graduation" or "termination"'
      });
    }

    const records = await BeneficiaryRecord.findAll({
      where: { type },
      order: [['created_at', 'DESC']]
    });

    res.json({
      records
    });

  } catch (error) {
    console.error('Error fetching records by type:', error);
    res.status(500).json({
      error: 'Failed to fetch records',
      details: error.message
    });
  }
});

// Get a specific record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const record = await BeneficiaryRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    res.json({
      record
    });

  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      error: 'Failed to fetch record',
      details: error.message
    });
  }
});

module.exports = router;
