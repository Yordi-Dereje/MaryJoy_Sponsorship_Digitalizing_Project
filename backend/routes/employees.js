const express = require('express');
const bcrypt = require('bcrypt');
const { Employee, UserCredentials, sequelize, Sequelize } = require('../models');
const router = express.Router();

// GET all employees
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    console.log('Fetching employees with search:', search);
    
    let query = `
      SELECT 
        id,
        full_name,
        phone_number,
        email,
        access_level,
        created_at,
        updated_at
      FROM employees
    `;

    const queryParams = [];
    
    if (search && search.trim() !== '') {
      query += ` WHERE (full_name ILIKE $1 OR phone_number ILIKE $1 OR email ILIKE $1 OR access_level ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    console.log('Executing employees query with params:', queryParams);
    const result = await sequelize.query(query, {
      replacements: queryParams,
      type: Sequelize.QueryTypes.SELECT
    });

    // Format the response to match frontend expectations
    const employees = result.map(employee => ({
      id: employee.id,
      employeeName: employee.full_name,
      phone: employee.phone_number,
      email: employee.email,
      access: mapAccessLevel(employee.access_level), // Use mapping for frontend
      created_at: employee.created_at,
      updated_at: employee.updated_at
    }));

    res.json({
      employees,
      total: employees.length,
      message: 'Employees fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Helper function to map database access levels to frontend display format
function mapAccessLevel(accessLevel) {
  const mapping = {
    'admin': 'Administrator',
    'coordinator': 'Coordinator',
    'database_officer': 'Database Officer'
  };
  return mapping[accessLevel] || accessLevel;
}

// Helper function to map frontend access levels to database values
function mapAccessLevelReverse(accessLevel) {
  const mapping = {
    'Administrator': 'admin',
    'Coordinator': 'coordinator',
    'Database Officer': 'database_officer'
  };
  return mapping[accessLevel] || accessLevel;
}

// GET employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const response = {
      id: employee.id,
      employeeName: employee.full_name,
      phone: employee.phone_number,
      email: employee.email,
      access: mapAccessLevel(employee.access_level),
      created_at: employee.created_at,
      updated_at: employee.updated_at
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new employee
router.post('/', async (req, res) => {
  try {
    const { 
      full_name, phone_number, email, 
      access_level, password 
    } = req.body;

    // Validate required fields
    if (!full_name || !phone_number || !email || !access_level || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      where: { email }
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create employee
    const employee = await Employee.create({
      full_name,
      phone_number,
      email,
      access_level: mapAccessLevelReverse(access_level), // Map to database format
      created_by: req.user?.id || 1 // Use authenticated user ID or default
    });

    // Create user credentials
    const userCredentials = await UserCredentials.create({
      email,
      phone_number,
      password_hash,
      role: mapAccessLevelReverse(access_level), // Use same mapping
      employee_id: employee.id,
      is_active: true
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: employee.id,
        employeeName: employee.full_name,
        phone: employee.phone_number,
        email: employee.email,
        access: mapAccessLevel(employee.access_level) // Map back for response
      }
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Map frontend access levels to database values if provided
    if (updates.access) {
      updates.access_level = mapAccessLevelReverse(updates.access);
      delete updates.access;
    }

    await employee.update(updates);

    // Also update user_credentials if access_level was changed
    if (updates.access_level) {
      const userCredentials = await UserCredentials.findOne({
        where: { employee_id: id }
      });
      
      if (userCredentials) {
        await userCredentials.update({ role: updates.access_level });
      }
    }

    res.json({
      message: 'Employee updated successfully',
      employee: {
        id: employee.id,
        employeeName: employee.full_name,
        phone: employee.phone_number,
        email: employee.email,
        access: mapAccessLevel(employee.access_level)
      }
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Also delete user credentials
    await UserCredentials.destroy({
      where: { employee_id: id }
    });

    await employee.destroy();

    res.json({ message: 'Employee deleted successfully' });

  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
