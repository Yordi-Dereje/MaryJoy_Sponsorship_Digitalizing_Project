const request = require('supertest');
const { UserCredentials, Employee, Sponsor, sequelize } = require('../models');
const bcrypt = require('bcrypt');

const app = require('../server');

describe('Authentication API Tests', () => {
  let testEmployee;
  let testSponsor;

  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Create test employee
    testEmployee = await Employee.create({
      full_name: 'Test Admin',
      phone_number: '+251911111111',
      email: 'admin@test.com',
      role: 'admin',
      status: 'active',
      created_by: 1
    });

    // Create user credentials for employee
    const hashedPassword = await bcrypt.hash('TestPass123', 12);
    await UserCredentials.create({
      email: 'admin@test.com',
      phone_number: '+251911111111',
      password_hash: hashedPassword,
      role: 'admin',
      employee_id: testEmployee.id,
      is_active: true
    });

    // Create test sponsor
    testSponsor = await Sponsor.create({
      cluster_id: 'AU',
      specific_id: '0001',
      type: 'individual',
      full_name: 'Test Sponsor',
      phone_number: '+251922222222',
      starting_date: '2025-01-01',
      agreed_monthly_payment: 750,
      status: 'active',
      is_diaspora: false,
      created_by: 1
    });

    // Create user credentials for sponsor
    const sponsorPassword = await bcrypt.hash('2222', 12);
    await UserCredentials.create({
      phone_number: '+251922222222',
      password_hash: sponsorPassword,
      role: 'sponsor',
      sponsor_cluster_id: 'AU',
      sponsor_specific_id: '0001',
      is_active: true
    });
  });

  afterEach(async () => {
    await UserCredentials.destroy({ where: { email: 'admin@test.com' } });
    await UserCredentials.destroy({ where: { phone_number: '+251922222222' } });
    await Employee.destroy({ where: { id: testEmployee.id } });
    await Sponsor.destroy({ where: { cluster_id: 'AU' } });
  });

  describe('POST /api/auth/login - Employee Login', () => {
    test('TC-A01: Should login employee with valid credentials', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user.email).toBe('admin@test.com');
    });

    test('TC-A02: Should fail login with incorrect password', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });

    test('TC-A03: Should fail login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });

    test('TC-A04: Should fail login when missing email', async () => {
      const loginData = {
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-A05: Should fail login when missing password', async () => {
      const loginData = {
        email: 'admin@test.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-A06: Should fail login for inactive user', async () => {
      await UserCredentials.update(
        { is_active: false },
        { where: { email: 'admin@test.com' } }
      );

      const loginData = {
        email: 'admin@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('inactive');
    });
  });

  describe('POST /api/auth/sponsor-login - Sponsor Login', () => {
    test('TC-A07: Should login sponsor with valid phone and password', async () => {
      const loginData = {
        phone_number: '+251922222222',
        password: '2222'
      };

      const response = await request(app)
        .post('/api/auth/sponsor-login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('sponsor');
      expect(response.body.user.sponsor_cluster_id).toBe('AU');
    });

    test('TC-A08: Should fail sponsor login with incorrect password', async () => {
      const loginData = {
        phone_number: '+251922222222',
        password: '9999'
      };

      const response = await request(app)
        .post('/api/auth/sponsor-login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });

    test('TC-A09: Should fail sponsor login with non-existent phone', async () => {
      const loginData = {
        phone_number: '+251999999999',
        password: '1234'
      };

      const response = await request(app)
        .post('/api/auth/sponsor-login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });

    test('TC-A10: Should fail sponsor login when missing phone_number', async () => {
      const loginData = {
        password: '2222'
      };

      const response = await request(app)
        .post('/api/auth/sponsor-login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/change-password - Change Password', () => {
    test('TC-A11: Should change employee password successfully', async () => {
      const changeData = {
        email: 'admin@test.com',
        old_password: 'TestPass123',
        new_password: 'NewPass456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changeData)
        .expect(200);

      expect(response.body.message).toContain('success');

      // Verify new password works
      const loginData = {
        email: 'admin@test.com',
        password: 'NewPass456'
      };

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    test('TC-A12: Should fail password change with incorrect old password', async () => {
      const changeData = {
        email: 'admin@test.com',
        old_password: 'WrongOldPass',
        new_password: 'NewPass456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changeData)
        .expect(401);

      expect(response.body.error).toContain('incorrect');
    });

    test('TC-A13: Should fail password change for non-existent user', async () => {
      const changeData = {
        email: 'nonexistent@test.com',
        old_password: 'TestPass123',
        new_password: 'NewPass456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changeData)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/auth/reset-password - Reset Password', () => {
    test('TC-A14: Should reset password for employee', async () => {
      const resetData = {
        email: 'admin@test.com',
        new_password: 'ResetPass789'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toContain('success');

      // Verify new password works
      const loginData = {
        email: 'admin@test.com',
        password: 'ResetPass789'
      };

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    test('TC-A15: Should reset password for sponsor', async () => {
      const resetData = {
        phone_number: '+251922222222',
        new_password: '5555'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toContain('success');

      // Verify new password works
      const loginData = {
        phone_number: '+251922222222',
        password: '5555'
      };

      const loginResponse = await request(app)
        .post('/api/auth/sponsor-login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    test('TC-A16: Should fail reset for non-existent user', async () => {
      const resetData = {
        email: 'nonexistent@test.com',
        new_password: 'NewPass123'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('JWT Token Tests', () => {
    test('TC-A17: Should include valid JWT token in login response', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('TC-A18: Should include user information in login response', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user.email).toBe('admin@test.com');
    });
  });

  describe('Role-Based Authentication Tests', () => {
    test('TC-A19: Should authenticate admin role', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.role).toBe('admin');
    });

    test('TC-A20: Should authenticate sponsor role', async () => {
      const loginData = {
        phone_number: '+251922222222',
        password: '2222'
      };

      const response = await request(app)
        .post('/api/auth/sponsor-login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.role).toBe('sponsor');
    });
  });
});
