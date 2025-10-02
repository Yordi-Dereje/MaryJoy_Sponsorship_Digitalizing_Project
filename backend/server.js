const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');

require('dotenv').config();
require('./models');

// Import both the sequelize instance and testConnection
const sequelize = require('./config/database');
const { testConnection } = require('./config/database');
const beneficiaryRoutes = require('./routes/beneficiaries');
const sponsorRoutes = require('./routes/sponsors');
const employeeRoutes = require('./routes/employees');
const sponsorRequestRoutes = require('./routes/sponsorRequests');
const { router: authRoutes } = require('./routes/auth');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced query monitoring to catch problematic queries
const originalQuery = sequelize.dialect.Query.prototype.selectQuery;
sequelize.dialect.Query.prototype.selectQuery = function() {
  const sql = originalQuery.apply(this, arguments);
  
  // Monitor for problematic queries
  if (sql.includes('Sponsor') && sql.includes('guardian_id')) {
    console.error('🚨 PROBLEMATIC SPONSOR QUERY DETECTED:');
    console.error('SQL:', sql);
    console.error('STACK TRACE:');
    console.error(new Error().stack);
    console.error('This query is trying to access guardian_id on Sponsor table, which does not exist!');
  }
  
  // Monitor for other potential issues
  if (sql.includes('Sponsor') && (sql.includes('guardian') || sql.includes('Guardian'))) {
    console.warn('⚠️  WARNING: Sponsor query with guardian reference detected:');
    console.warn('SQL:', sql);
  }
  
  return sql;
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
testConnection().then(isConnected => {
  if (!isConnected) {
    console.log('⚠️  Server starting without database connection');
  } else {
    // Validate model associations on startup
    const AssociationValidator = require('./utils/associationValidator');
    const associationErrors = AssociationValidator.logValidationResults();
    
    if (associationErrors.length > 0) {
      console.error('⚠️  Model association issues detected. Please review your model definitions.');
    }
  }
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Single upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No file uploaded or invalid file type" 
      });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      fileUrl: fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "File upload failed" 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/beneficiaries', require('./routes/beneficiaries'));
app.use('/api/employees', employeeRoutes);
app.use('/api/sponsor-requests', sponsorRequestRoutes);
app.use('/api/sponsor_requests', sponsorRequestRoutes);
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/sponsorships', require('./routes/sponsorships'));
app.use('/api/guardians', require('./routes/guardians'));
app.use('/api/financial', require('./routes/financial'));
app.use('/api/feedbacks', require('./routes/feedback'));
app.use('/api/search', searchRoutes);
app.use('/api/beneficiary-records', require('./routes/beneficiaryRecords'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Add middleware to catch Sequelize errors during request processing
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Check if there's an error in the response
    if (data && typeof data === 'object' && data.error) {
      console.error('Response error detected:', data.error);
    }
    return originalSend.call(this, data);
  };
  next();
});

// Enhanced error handling middleware for database errors
app.use((error, req, res, next) => {
  // Handle specific database column errors
  if (error.original && error.original.code === '42703') {
    console.error('DATABASE COLUMN ERROR DETECTED:');
    console.error('Error Code:', error.original.code);
    console.error('Error Message:', error.original.message);
    console.error('SQL:', error.sql);
    console.error('Route:', req.method, req.url);
    console.error('Request Body:', req.body);
    console.error('Request Query:', req.query);
    console.error('Stack Trace:', error.stack);
    
    // Handle specific Sponsor.guardian_id error
    if (error.sql && error.sql.includes('Sponsor"."guardian_id')) {
      return res.status(500).json({ 
        error: 'Database query error',
        details: 'Incorrect association between Sponsor and Guardian models',
        message: 'The Sponsor model does not have a guardian_id column. Please check your Sequelize associations.',
        suggestion: 'Review your model associations in models/index.js to ensure correct foreign key relationships.'
      });
    }
    
    // Handle other column errors
    return res.status(500).json({ 
      error: 'Database column error',
      details: 'A database column does not exist',
      message: error.original.message,
      suggestion: 'Please check your database schema and model definitions.'
    });
  }
  
  // Handle other database errors
  if (error.original && error.original.code) {
    console.error('DATABASE ERROR:', error.original.code, error.original.message);
    return res.status(500).json({ 
      error: 'Database error',
      details: error.original.message,
      code: error.original.code
    });
  }
  
  // Handle general errors
  console.error('GENERAL ERROR:', error.message);
  next(error);
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      message: 'Server is running!',
      database: isConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Handle Multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  res.status(500).json({
    success: false,
    error: error.message || 'Upload failed'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
