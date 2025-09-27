const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Report, Employee, UserCredentials } = require('../models');
const { authenticateToken, requireRole } = require('./auth');

// Configure multer for report file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/reports/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'text/plain': true,
    'text/csv': true
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for reports
  },
  fileFilter: fileFilter
});

// GET /api/reports - Get all reports (all authenticated users can view)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: Employee,
          as: 'creator',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      reports: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// GET /api/reports/:id - Get specific report (all authenticated users can view)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'creator',
          attributes: ['id', 'full_name']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    });
  }
});

// POST /api/reports - Create new report (admin and database_officer only)
router.post('/', authenticateToken, requireRole(['admin', 'database_officer']), upload.single('file'), async (req, res) => {
  try {
    const { file_name } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    if (!file_name) {
      return res.status(400).json({
        success: false,
        error: 'File name is required'
      });
    }

    const filePath = `/uploads/reports/${req.file.filename}`;
    
    // Get the employee ID based on user role
    let employeeId;
    if (req.user.role === 'sponsor') {
      // For sponsors, we need to find an employee to associate with (could be the admin who manages reports)
      // For now, we'll use a default admin employee or handle this differently
      return res.status(403).json({
        success: false,
        error: 'Sponsors cannot create reports'
      });
    } else {
      // For employees (admin, database_officer, coordinator)
      const userCredentials = await UserCredentials.findByPk(req.user.id);
      employeeId = userCredentials.employee_id;
    }

    const report = await Report.create({
      file_name: file_name,
      file: filePath,
      created_by: employeeId,
      created_at: new Date()
    });

    // Fetch the created report with creator details
    const createdReport = await Report.findByPk(report.id, {
      include: [
        {
          model: Employee,
          as: 'creator',
          attributes: ['id', 'full_name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      report: createdReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'reports', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create report'
    });
  }
});

// PUT /api/reports/:id - Update report (admin and database_officer only)
router.put('/:id', authenticateToken, requireRole(['admin', 'database_officer']), upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { file_name } = req.body;
    
    const report = await Report.findByPk(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    const updateData = {};
    
    if (file_name) {
      updateData.file_name = file_name;
    }
    
    // If new file is uploaded, update file path and delete old file
    if (req.file) {
      const oldFilePath = path.join(__dirname, '..', report.file);
      const newFilePath = `/uploads/reports/${req.file.filename}`;
      
      updateData.file = newFilePath;
      
      // Delete old file
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await report.update(updateData);

    // Fetch updated report with creator details
    const updatedReport = await Report.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'creator',
          attributes: ['id', 'full_name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'reports', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update report'
    });
  }
});

// DELETE /api/reports/:id - Delete report (admin and database_officer only)
router.delete('/:id', authenticateToken, requireRole(['admin', 'database_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findByPk(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Delete the file from filesystem
    // Convert Buffer to string if necessary
    const filePathStr = Buffer.isBuffer(report.file) ? report.file.toString('utf8') : report.file;
    const filePath = path.join(__dirname, '..', filePathStr);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await report.destroy();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report'
    });
  }
});

// GET /api/reports/:id/download - Download report file (all authenticated users can download)
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findByPk(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Convert Buffer to string if necessary
    const filePathStr = Buffer.isBuffer(report.file) ? report.file.toString('utf8') : report.file;
    const filePath = path.join(__dirname, '..', filePathStr);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Report file not found'
      });
    }

    // Get file extension from the stored file path
    const fileExtension = path.extname(filePathStr);
    const fileName = report.file_name.includes('.') ? report.file_name : `${report.file_name}${fileExtension}`;
    
    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download report'
    });
  }
});

module.exports = router;
