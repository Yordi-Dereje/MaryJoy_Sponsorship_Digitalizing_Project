const request = require('supertest');
const { Employee, UserCredentials, sequelize } = require('../models');

const app = require('../server');

describe('Employee API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Employee.destroy({ where: { id: { $gt: 1000 } } });
    await UserCredentials.destroy({ where: { employee_id: { $gt: 1000 } } });
  });

  describe('POST /api/employees - Create Employee', () => {
    test('TC-E01: Should create an admin employee', async () => {
      const employeeData = {
        full_name: 'Admin User',
        phone_number: '+251911234567',
        email: 'admin@example.com',
        role: 'admin',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.employee.full_name).toBe('Admin User');
      expect(response.body.employee.role).toBe('admin');
    });

    test('TC-E02: Should create a case_worker employee', async () => {
      const employeeData = {
        full_name: 'Case Worker',
        phone_number: '+251922345678',
        email: 'caseworker@example.com',
        role: 'case_worker',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.employee.role).toBe('case_worker');
    });

    test('TC-E03: Should create a finance_manager employee', async () => {
      const employeeData = {
        full_name: 'Finance Manager',
        phone_number: '+251933456789',
        email: 'finance@example.com',
        role: 'finance_manager',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.employee.role).toBe('finance_manager');
    });

    test('TC-E04: Should create employee with active status', async () => {
      const employeeData = {
        full_name: 'Active Employee',
        phone_number: '+251944567890',
        email: 'active@example.com',
        role: 'case_worker',
        status: 'active',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.employee.status).toBe('active');
    });

    test('TC-E05: Should auto-create user credentials for employee', async () => {
      const employeeData = {
        full_name: 'Credentials Test',
        phone_number: '+251955678901',
        email: 'credentials@example.com',
        role: 'admin',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);

      const credentials = await UserCredentials.findOne({
        where: { employee_id: response.body.employee.id }
      });

      expect(credentials).not.toBeNull();
      expect(credentials.email).toBe('credentials@example.com');
      expect(credentials.role).toBe('admin');
    });

    test('TC-E06: Should fail when missing required field - full_name', async () => {
      const employeeData = {
        phone_number: '+251966789012',
        email: 'test@example.com',
        role: 'admin',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-E07: Should fail when missing required field - email', async () => {
      const employeeData = {
        full_name: 'Test Employee',
        phone_number: '+251977890123',
        role: 'admin',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-E08: Should fail when missing required field - role', async () => {
      const employeeData = {
        full_name: 'Test Employee',
        phone_number: '+251988901234',
        email: 'test@example.com',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-E09: Should fail when email already exists', async () => {
      const employeeData = {
        full_name: 'First Employee',
        phone_number: '+251999012345',
        email: 'duplicate@example.com',
        role: 'admin',
        password: 'SecurePass123',
        created_by: 1
      };

      await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);

      const duplicateData = {
        full_name: 'Second Employee',
        phone_number: '+251910123456',
        email: 'duplicate@example.com',
        role: 'admin',
        password: 'SecurePass123',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/employees')
        .send(duplicateData)
        .expect(400);

      expect(response.body.error).toContain('email');
    });
  });

  describe('GET /api/employees - Get All Employees', () => {
    test('TC-E10: Should retrieve all employees', async () => {
      const response = await request(app)
        .get('/api/employees')
        .expect(200);

      expect(response.body.employees).toBeDefined();
      expect(Array.isArray(response.body.employees)).toBe(true);
    });

    test('TC-E11: Should filter employees by role', async () => {
      const response = await request(app)
        .get('/api/employees?role=admin')
        .expect(200);

      expect(response.body.employees).toBeDefined();
    });

    test('TC-E12: Should filter employees by status', async () => {
      const response = await request(app)
        .get('/api/employees?status=active')
        .expect(200);

      expect(response.body.employees).toBeDefined();
    });

    test('TC-E13: Should search employees by name', async () => {
      await Employee.create({
        full_name: 'Searchable Employee',
        phone_number: '+251921234567',
        email: 'searchable@example.com',
        role: 'admin',
        status: 'active',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/employees?search=Searchable')
        .expect(200);

      expect(response.body.employees.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/employees/:id - Get Single Employee', () => {
    test('TC-E14: Should retrieve a specific employee by ID', async () => {
      const employee = await Employee.create({
        full_name: 'Specific Employee',
        phone_number: '+251932345678',
        email: 'specific@example.com',
        role: 'admin',
        status: 'active',
        created_by: 1
      });

      const response = await request(app)
        .get(`/api/employees/${employee.id}`)
        .expect(200);

      expect(response.body.id).toBe(employee.id);
      expect(response.body.full_name).toBe('Specific Employee');
    });

    test('TC-E15: Should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .get('/api/employees/99999')
        .expect(404);

      expect(response.body.error).toBe('Employee not found');
    });
  });

  describe('PUT /api/employees/:id - Update Employee', () => {
    test('TC-E16: Should update employee information', async () => {
      const employee = await Employee.create({
        full_name: 'Original Name',
        phone_number: '+251943456789',
        email: 'original@example.com',
        role: 'admin',
        status: 'active',
        created_by: 1
      });

      const updates = {
        full_name: 'Updated Name',
        phone_number: '+251944444444'
      };

      const response = await request(app)
        .put(`/api/employees/${employee.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.employee.full_name).toBe('Updated Name');
      expect(response.body.employee.phone_number).toBe('+251944444444');
    });

    test('TC-E17: Should update employee status', async () => {
      const employee = await Employee.create({
        full_name: 'Status Test',
        phone_number: '+251954567890',
        email: 'status@example.com',
        role: 'admin',
        status: 'active',
        created_by: 1
      });

      const updates = { status: 'inactive' };

      const response = await request(app)
        .put(`/api/employees/${employee.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.employee.status).toBe('inactive');
    });

    test('TC-E18: Should return 404 when updating non-existent employee', async () => {
      const updates = { full_name: 'New Name' };

      const response = await request(app)
        .put('/api/employees/99999')
        .send(updates)
        .expect(404);

      expect(response.body.error).toBe('Employee not found');
    });
  });

  describe('DELETE /api/employees/:id - Delete Employee', () => {
    test('TC-E19: Should delete an employee', async () => {
      const employee = await Employee.create({
        full_name: 'To Be Deleted',
        phone_number: '+251965678901',
        email: 'deleted@example.com',
        role: 'admin',
        status: 'active',
        created_by: 1
      });

      const response = await request(app)
        .delete(`/api/employees/${employee.id}`)
        .expect(200);

      expect(response.body.message).toBe('Employee deleted successfully');

      const deletedEmployee = await Employee.findByPk(employee.id);
      expect(deletedEmployee).toBeNull();
    });

    test('TC-E20: Should return 404 when deleting non-existent employee', async () => {
      const response = await request(app)
        .delete('/api/employees/99999')
        .expect(404);

      expect(response.body.error).toBe('Employee not found');
    });
  });
});
