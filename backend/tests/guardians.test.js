const request = require('supertest');
const { Guardian, Address, sequelize } = require('../models');

const app = require('../server');

describe('Guardian API Tests', () => {
  let testAddress;

  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    testAddress = await Address.create({
      country: 'Ethiopia',
      region: 'Addis Ababa',
      sub_region: 'Bole',
      woreda: 'Woreda 01',
      house_number: '123'
    });
  });

  afterEach(async () => {
    await Guardian.destroy({ where: { id: { $gt: 0 } } });
    if (testAddress) await Address.destroy({ where: { id: testAddress.id } });
  });

  describe('POST /api/guardians - Create Guardian', () => {
    test('TC-G01: Should create a guardian with all required fields', async () => {
      const guardianData = {
        full_name: 'John Guardian',
        phone_number: '+251911234567',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(201);

      expect(response.body.guardian.full_name).toBe('John Guardian');
      expect(response.body.guardian.phone_number).toBe('+251911234567');
      expect(response.body.guardian.relationship).toBe('parent');
    });

    test('TC-G02: Should create guardian with email', async () => {
      const guardianData = {
        full_name: 'Jane Guardian',
        phone_number: '+251922345678',
        email: 'jane@example.com',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(201);

      expect(response.body.guardian.email).toBe('jane@example.com');
    });

    test('TC-G03: Should create guardian with grandparent relationship', async () => {
      const guardianData = {
        full_name: 'Mary Grandparent',
        phone_number: '+251933456789',
        relationship: 'grandparent',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(201);

      expect(response.body.guardian.relationship).toBe('grandparent');
    });

    test('TC-G04: Should create guardian with sibling relationship', async () => {
      const guardianData = {
        full_name: 'Tom Sibling',
        phone_number: '+251944567890',
        relationship: 'sibling',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(201);

      expect(response.body.guardian.relationship).toBe('sibling');
    });

    test('TC-G05: Should create guardian with other relationship', async () => {
      const guardianData = {
        full_name: 'Sarah Other',
        phone_number: '+251955678901',
        relationship: 'other',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(201);

      expect(response.body.guardian.relationship).toBe('other');
    });

    test('TC-G06: Should create guardian with emergency contact', async () => {
      const guardianData = {
        full_name: 'Robert Guardian',
        phone_number: '+251966789012',
        relationship: 'parent',
        emergency_contact_name: 'Emergency Person',
        emergency_contact_phone: '+251977890123',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(201);

      expect(response.body.guardian.emergency_contact_name).toBe('Emergency Person');
      expect(response.body.guardian.emergency_contact_phone).toBe('+251977890123');
    });

    test('TC-G07: Should fail when missing required field - full_name', async () => {
      const guardianData = {
        phone_number: '+251988901234',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-G08: Should fail when missing required field - phone_number', async () => {
      const guardianData = {
        full_name: 'Test Guardian',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-G09: Should fail when missing required field - relationship', async () => {
      const guardianData = {
        full_name: 'Test Guardian',
        phone_number: '+251999012345',
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/guardians')
        .send(guardianData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/guardians - Get All Guardians', () => {
    test('TC-G10: Should retrieve all guardians', async () => {
      await Guardian.create({
        full_name: 'Guardian 1',
        phone_number: '+251911111111',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      await Guardian.create({
        full_name: 'Guardian 2',
        phone_number: '+251922222222',
        relationship: 'grandparent',
        address_id: testAddress.id,
        created_by: 1
      });

      const response = await request(app)
        .get('/api/guardians')
        .expect(200);

      expect(response.body.guardians).toBeDefined();
      expect(Array.isArray(response.body.guardians)).toBe(true);
      expect(response.body.guardians.length).toBeGreaterThanOrEqual(2);
    });

    test('TC-G11: Should search guardians by name', async () => {
      await Guardian.create({
        full_name: 'Searchable Guardian',
        phone_number: '+251933333333',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      const response = await request(app)
        .get('/api/guardians?search=Searchable')
        .expect(200);

      expect(response.body.guardians.length).toBeGreaterThan(0);
    });

    test('TC-G12: Should filter guardians by relationship', async () => {
      await Guardian.create({
        full_name: 'Parent Guardian',
        phone_number: '+251944444444',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      const response = await request(app)
        .get('/api/guardians?relationship=parent')
        .expect(200);

      expect(response.body.guardians).toBeDefined();
    });
  });

  describe('GET /api/guardians/:id - Get Single Guardian', () => {
    test('TC-G13: Should retrieve a specific guardian by ID', async () => {
      const guardian = await Guardian.create({
        full_name: 'Specific Guardian',
        phone_number: '+251955555555',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      const response = await request(app)
        .get(`/api/guardians/${guardian.id}`)
        .expect(200);

      expect(response.body.id).toBe(guardian.id);
      expect(response.body.full_name).toBe('Specific Guardian');
    });

    test('TC-G14: Should return 404 for non-existent guardian', async () => {
      const response = await request(app)
        .get('/api/guardians/99999')
        .expect(404);

      expect(response.body.error).toBe('Guardian not found');
    });
  });

  describe('PUT /api/guardians/:id - Update Guardian', () => {
    test('TC-G15: Should update guardian information', async () => {
      const guardian = await Guardian.create({
        full_name: 'Original Name',
        phone_number: '+251966666666',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      const updates = {
        full_name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/guardians/${guardian.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.guardian.full_name).toBe('Updated Name');
      expect(response.body.guardian.email).toBe('updated@example.com');
    });

    test('TC-G16: Should update guardian relationship', async () => {
      const guardian = await Guardian.create({
        full_name: 'Test Guardian',
        phone_number: '+251977777777',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      const updates = { relationship: 'grandparent' };

      const response = await request(app)
        .put(`/api/guardians/${guardian.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.guardian.relationship).toBe('grandparent');
    });

    test('TC-G17: Should return 404 when updating non-existent guardian', async () => {
      const updates = { full_name: 'New Name' };

      const response = await request(app)
        .put('/api/guardians/99999')
        .send(updates)
        .expect(404);

      expect(response.body.error).toBe('Guardian not found');
    });
  });

  describe('DELETE /api/guardians/:id - Delete Guardian', () => {
    test('TC-G18: Should delete a guardian', async () => {
      const guardian = await Guardian.create({
        full_name: 'To Be Deleted',
        phone_number: '+251988888888',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      const response = await request(app)
        .delete(`/api/guardians/${guardian.id}`)
        .expect(200);

      expect(response.body.message).toBe('Guardian deleted successfully');

      const deletedGuardian = await Guardian.findByPk(guardian.id);
      expect(deletedGuardian).toBeNull();
    });

    test('TC-G19: Should return 404 when deleting non-existent guardian', async () => {
      const response = await request(app)
        .delete('/api/guardians/99999')
        .expect(404);

      expect(response.body.error).toBe('Guardian not found');
    });
  });

  describe('Guardian with Beneficiaries Tests', () => {
    test('TC-G20: Should retrieve guardian with beneficiaries', async () => {
      const guardian = await Guardian.create({
        full_name: 'Guardian With Children',
        phone_number: '+251999999999',
        relationship: 'parent',
        address_id: testAddress.id,
        created_by: 1
      });

      const response = await request(app)
        .get(`/api/guardians/${guardian.id}`)
        .expect(200);

      expect(response.body.beneficiaries).toBeDefined();
    });
  });
});
