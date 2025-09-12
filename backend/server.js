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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection on startup
testConnection().then(isConnected => {
  if (!isConnected) {
    console.log('⚠️  Server starting without database connection');
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
app.use('/api/beneficiaries', require('./routes/beneficiaries'));
app.use('/api/employees', employeeRoutes);
app.use('/api/sponsor-requests', sponsorRequestRoutes);
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/sponsorships', require('./routes/sponsorships'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

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
