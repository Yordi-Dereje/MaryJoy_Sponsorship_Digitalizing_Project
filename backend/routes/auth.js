const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserCredentials, Employee, Sponsor } = require('../models');
const router = express.Router();

// JWT secret key (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check user roles
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Custom method to find user by email or phone
UserCredentials.findByEmailOrPhone = async function(identifier) {
  const { Op } = require('sequelize');
  return await this.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { phone_number: identifier }
      ]
    }
  });
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ 
        error: 'Email/phone and password are required' 
      });
    }

    // Find user by email or phone
    const userCredentials = await UserCredentials.findByEmailOrPhone(identifier);
    
    console.log('🔍 User lookup result:', {
      identifier: identifier,
      found: !!userCredentials,
      userId: userCredentials?.id,
      role: userCredentials?.role,
      email: userCredentials?.email,
      phone: userCredentials?.phone_number
    });
    
    if (!userCredentials) {
      console.log('❌ User not found for identifier:', identifier);
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (!userCredentials.is_active) {
      return res.status(401).json({ 
        error: 'Account is deactivated' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userCredentials.password_hash);
    
    console.log('🔐 Password verification:', {
      providedPassword: password,
      storedHash: userCredentials.password_hash,
      isValid: isValidPassword
    });
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', identifier);
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Get user details based on role
    let userDetails = {};
    let fullName = '';
    let userId = '';

    if (userCredentials.role === 'sponsor') {
      // For sponsors, get sponsor details
      const sponsor = await Sponsor.findOne({
        where: {
          cluster_id: userCredentials.sponsor_cluster_id,
          specific_id: userCredentials.sponsor_specific_id
        }
      });
      
      if (sponsor) {
        userDetails = sponsor.toJSON();
        fullName = sponsor.full_name;
        userId = `${sponsor.cluster_id}-${sponsor.specific_id}`;
      }
    } else {
      // For employees, get employee details
      const employee = await Employee.findByPk(userCredentials.employee_id);
      
      if (employee) {
        userDetails = employee.toJSON();
        fullName = employee.full_name;
        userId = employee.id.toString();
      }
    }

    // Update last login
    await userCredentials.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userCredentials.id,
        role: userCredentials.role,
        userId: userId,
        fullName: fullName,
        email: userCredentials.email,
        phone: userCredentials.phone_number
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({
      success: true,
      token: token,
      user: {
        id: userCredentials.id,
        role: userCredentials.role,
        userId: userId,
        fullName: fullName,
        email: userCredentials.email,
        phone: userCredentials.phone_number,
        lastLogin: userCredentials.last_login
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const userCredentials = await UserCredentials.findByPk(req.user.id);

    if (!userCredentials || !userCredentials.is_active) {
      return res.status(401).json({ 
        error: 'Invalid or inactive user' 
      });
    }

    res.json({
      success: true,
      user: {
        id: userCredentials.id,
        role: userCredentials.role,
        userId: req.user.userId,
        fullName: req.user.fullName,
        email: userCredentials.email,
        phone: userCredentials.phone_number,
        lastLogin: userCredentials.last_login
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error during token verification' 
    });
  }
});

// Add to routes/auth.js
router.post('/debug-login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      
      // Find user
      const userCredentials = await UserCredentials.findByEmailOrPhone(identifier);
      
      if (!userCredentials) {
        return res.json({ error: 'User not found', identifier });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, userCredentials.password_hash);
      
      if (!isValidPassword) {
        return res.json({ error: 'Invalid password', identifier });
      }
      
      // Get employee data
      const employee = await Employee.findByPk(userCredentials.employee_id);
      
      res.json({
        success: true,
        userCredentials: {
          id: userCredentials.id,
          email: userCredentials.email,
          role: userCredentials.role,
          employee_id: userCredentials.employee_id
        },
        employee: employee ? {
          id: employee.id,
          full_name: employee.full_name,
          role: employee.role
        } : null,
        shouldRedirectTo: userCredentials.role + '_dashboard'
      });
      
    } catch (error) {
      res.json({ error: error.message });
    }
  });

// Add this debug route to your auth.js temporarily
router.post('/debug-verify', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Debug verification for:', email);
    
    // Find user in both tables
    const employee = await Employee.findOne({ where: { email } });
    const userCred = await UserCredentials.findOne({ where: { email } });
    
    console.log('Employee found:', !!employee);
    console.log('UserCred found:', !!userCred);
    
    if (employee) {
      console.log('Employee password hash:', employee.password_hash);
      const empValid = await bcrypt.compare(password, employee.password_hash);
      console.log('Employee password valid:', empValid);
    }
    
    if (userCred) {
      console.log('UserCred password hash:', userCred.password_hash);
      const credValid = await bcrypt.compare(password, userCred.password_hash);
      console.log('UserCred password valid:', credValid);
    }
    
    res.json({ 
      employeeExists: !!employee,
      userCredExists: !!userCred,
      employeeHash: employee ? employee.password_hash : null,
      userCredHash: userCred ? userCred.password_hash : null
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User profile update endpoint
router.put('/user/update', authenticateToken, async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id;

    if (!email && !phone) {
      return res.status(400).json({ error: 'At least one field (email or phone) is required' });
    }

    // Find user credentials
    const userCredentials = await UserCredentials.findByPk(userId);
    if (!userCredentials) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user credentials
    const updateData = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone_number = phone;

    await userCredentials.update(updateData);

    // Update corresponding employee or sponsor record
    if (userCredentials.role === 'sponsor') {
      const sponsor = await Sponsor.findOne({
        where: {
          cluster_id: userCredentials.sponsor_cluster_id,
          specific_id: userCredentials.sponsor_specific_id
        }
      });
      
      if (sponsor) {
        const sponsorUpdateData = {};
        if (email) sponsorUpdateData.email = email;
        if (phone) sponsorUpdateData.phone_number = phone;
        await sponsor.update(sponsorUpdateData);
      }
    } else {
      // For employees
      const employee = await Employee.findByPk(userCredentials.employee_id);
      if (employee) {
        const employeeUpdateData = {};
        if (email) employeeUpdateData.email = email;
        if (phone) employeeUpdateData.phone_number = phone;
        await employee.update(employeeUpdateData);
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userCredentials.id,
        role: userCredentials.role,
        email: userCredentials.email,
        phone: userCredentials.phone_number
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password endpoint
router.post('/user/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Find user credentials
    const userCredentials = await UserCredentials.findByPk(userId);
    if (!userCredentials) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userCredentials.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await userCredentials.update({ password_hash: newPasswordHash });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, authenticateToken, requireRole };
