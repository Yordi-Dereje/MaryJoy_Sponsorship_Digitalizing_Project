const express = require('express');
const { Employee, sequelize, Sequelize } = require('../models');
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
        department,
        phone_number,
        email,
        access_level,
        date_of_birth,
        gender,
        created_at,
        updated_at
      FROM employees
    `;

    const queryParams = [];
    
    if (search && search.trim() !== '') {
      query += ` WHERE (full_name ILIKE $1 OR department ILIKE $1 OR phone_number ILIKE $1 OR email ILIKE $1 OR access_level ILIKE $1)`;
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
      department: employee.department,
      phone: employee.phone_number,
      email: employee.email,
      access: mapAccessLevel(employee.access_level),
      date_of_birth: employee.date_of_birth,
      gender: employee.gender,
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

// Helper function to map access levels to frontend format
function mapAccessLevel(accessLevel) {
  const mapping = {
    'admin': 'Administrator',
    'moderator': 'Coordinator',
    'viewer': 'Database Officer'
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
      department: employee.department,
      phone: employee.phone_number,
      email: employee.email,
      access: mapAccessLevel(employee.access_level),
      date_of_birth: employee.date_of_birth,
      gender: employee.gender,
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
      full_name, department, phone_number, email, 
      access_level, date_of_birth, gender, password 
    } = req.body;

    // Validate required fields
    if (!full_name || !department || !phone_number || !email || !access_level || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      where: { email }
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    const employee = await Employee.create({
      full_name,
      department,
      phone_number,
      email,
      access_level,
      date_of_birth,
      gender,
      password_hash: password // In production, you should hash this!
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: employee.id,
        employeeName: employee.full_name,
        department: employee.department,
        phone: employee.phone_number,
        email: employee.email,
        access: mapAccessLevel(employee.access_level)
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

    // Map frontend access levels to database values
    if (updates.access) {
      const accessMapping = {
        'Administrator': 'admin',
        'Coordinator': 'moderator',
        'Database Officer': 'viewer'
      };
      updates.access_level = accessMapping[updates.access] || updates.access;
      delete updates.access;
    }

    await employee.update(updates);

    res.json({
      message: 'Employee updated successfully',
      employee: {
        id: employee.id,
        employeeName: employee.full_name,
        department: employee.department,
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

    await employee.destroy();

    res.json({ message: 'Employee deleted successfully' });

  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
