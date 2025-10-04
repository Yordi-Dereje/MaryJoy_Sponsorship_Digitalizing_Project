const request = require('supertest');
const { Beneficiary, Guardian, Address, sequelize } = require('../models');

const app = require('../server');

describe('Beneficiary API Tests', () => {
  let testGuardian;
  let testAddress;

  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Create test address
    testAddress = await Address.create({
      country: 'Ethiopia',
      region: 'Addis Ababa',
      sub_region: 'Bole',
      woreda: 'Woreda 01',
      house_number: '123'
    });

    // Create test guardian
    testGuardian = await Guardian.create({
      full_name: 'Test Guardian',
      phone_number: '+251911111111',
      relationship: 'parent',
      address_id: testAddress.id,
      created_by: 1
    });
  });

  afterEach(async () => {
    await Beneficiary.destroy({ where: { id: { $gt: 0 } } });
    if (testGuardian) await Guardian.destroy({ where: { id: testGuardian.id } });
    if (testAddress) await Address.destroy({ where: { id: testAddress.id } });
  });

  describe('POST /api/beneficiaries - Create Child Beneficiary', () => {
    test('TC-B01: Should create a child beneficiary with all required fields', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'John Doe',
        date_of_birth: '2015-05-15',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.type).toBe('child');
      expect(response.body.beneficiary.full_name).toBe('John Doe');
      expect(response.body.beneficiary.gender).toBe('male');
    });

    test('TC-B02: Should create child with medical conditions', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Jane Smith',
        date_of_birth: '2016-03-20',
        gender: 'female',
        guardian_id: testGuardian.id,
        medical_conditions: 'Asthma',
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.medical_conditions).toBe('Asthma');
    });

    test('TC-B03: Should create child with school information', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Michael Johnson',
        date_of_birth: '2014-08-10',
        gender: 'male',
        guardian_id: testGuardian.id,
        school_name: 'ABC Primary School',
        grade_level: '5',
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.school_name).toBe('ABC Primary School');
      expect(response.body.beneficiary.grade_level).toBe('5');
    });

    test('TC-B04: Should fail when missing required field - full_name', async () => {
      const beneficiaryData = {
        type: 'child',
        date_of_birth: '2015-05-15',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-B05: Should fail when missing required field - date_of_birth', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Test Child',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/beneficiaries - Create Elderly Beneficiary', () => {
    test('TC-B06: Should create an elderly beneficiary', async () => {
      const beneficiaryData = {
        type: 'elderly',
        full_name: 'Sarah Williams',
        date_of_birth: '1950-12-25',
        gender: 'female',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.type).toBe('elderly');
      expect(response.body.beneficiary.full_name).toBe('Sarah Williams');
    });

    test('TC-B07: Should create elderly with medical conditions', async () => {
      const beneficiaryData = {
        type: 'elderly',
        full_name: 'Robert Brown',
        date_of_birth: '1945-06-15',
        gender: 'male',
        guardian_id: testGuardian.id,
        medical_conditions: 'Diabetes, Hypertension',
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.medical_conditions).toBe('Diabetes, Hypertension');
    });
  });

  describe('GET /api/beneficiaries - Get All Beneficiaries', () => {
    test('TC-B08: Should retrieve all beneficiaries', async () => {
      await Beneficiary.create({
        type: 'child',
        full_name: 'Test Child 1',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/beneficiaries')
        .expect(200);

      expect(response.body.beneficiaries).toBeDefined();
      expect(Array.isArray(response.body.beneficiaries)).toBe(true);
    });

    test('TC-B09: Should filter beneficiaries by type - children', async () => {
      const response = await request(app)
        .get('/api/beneficiaries/children')
        .expect(200);

      expect(response.body.beneficiaries).toBeDefined();
    });

    test('TC-B10: Should filter beneficiaries by type - elderly', async () => {
      const response = await request(app)
        .get('/api/beneficiaries/elderly')
        .expect(200);

      expect(response.body.beneficiaries).toBeDefined();
    });

    test('TC-B11: Should filter beneficiaries by status', async () => {
      const response = await request(app)
        .get('/api/beneficiaries?status=waiting_list')
        .expect(200);

      expect(response.body.beneficiaries).toBeDefined();
    });

    test('TC-B12: Should search beneficiaries by name', async () => {
      await Beneficiary.create({
        type: 'child',
        full_name: 'Searchable Name',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/beneficiaries?search=Searchable')
        .expect(200);

      expect(response.body.beneficiaries.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/beneficiaries/:id - Get Single Beneficiary', () => {
    test('TC-B13: Should retrieve a specific beneficiary by ID', async () => {
      const beneficiary = await Beneficiary.create({
        type: 'child',
        full_name: 'Specific Child',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      });

      const response = await request(app)
        .get(`/api/beneficiaries/${beneficiary.id}`)
        .expect(200);

      expect(response.body.id).toBe(beneficiary.id);
      expect(response.body.full_name).toBe('Specific Child');
    });

    test('TC-B14: Should return 404 for non-existent beneficiary', async () => {
      const response = await request(app)
        .get('/api/beneficiaries/99999')
        .expect(404);

      expect(response.body.error).toBe('Beneficiary not found');
    });
  });

  describe('PUT /api/beneficiaries/:id - Update Beneficiary', () => {
    test('TC-B15: Should update beneficiary information', async () => {
      const beneficiary = await Beneficiary.create({
        type: 'child',
        full_name: 'Original Name',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      });

      const updates = {
        full_name: 'Updated Name',
        school_name: 'New School'
      };

      const response = await request(app)
        .put(`/api/beneficiaries/${beneficiary.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.beneficiary.full_name).toBe('Updated Name');
      expect(response.body.beneficiary.school_name).toBe('New School');
    });

    test('TC-B16: Should update beneficiary status', async () => {
      const beneficiary = await Beneficiary.create({
        type: 'child',
        full_name: 'Status Test',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      });

      const updates = { status: 'active' };

      const response = await request(app)
        .put(`/api/beneficiaries/${beneficiary.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.beneficiary.status).toBe('active');
    });

    test('TC-B17: Should return 404 when updating non-existent beneficiary', async () => {
      const updates = { full_name: 'New Name' };

      const response = await request(app)
        .put('/api/beneficiaries/99999')
        .send(updates)
        .expect(404);

      expect(response.body.error).toBe('Beneficiary not found');
    });
  });

  describe('DELETE /api/beneficiaries/:id - Delete Beneficiary', () => {
    test('TC-B18: Should delete a beneficiary', async () => {
      const beneficiary = await Beneficiary.create({
        type: 'child',
        full_name: 'To Be Deleted',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      });

      const response = await request(app)
        .delete(`/api/beneficiaries/${beneficiary.id}`)
        .expect(200);

      expect(response.body.message).toBe('Beneficiary deleted successfully');

      const deletedBeneficiary = await Beneficiary.findByPk(beneficiary.id);
      expect(deletedBeneficiary).toBeNull();
    });

    test('TC-B19: Should return 404 when deleting non-existent beneficiary', async () => {
      const response = await request(app)
        .delete('/api/beneficiaries/99999')
        .expect(404);

      expect(response.body.error).toBe('Beneficiary not found');
    });
  });

  describe('Beneficiary Status Tests', () => {
    test('TC-B20: Should support waiting_list status', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Waiting Child',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'waiting_list',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.status).toBe('waiting_list');
    });

    test('TC-B21: Should support active status', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Active Child',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'active',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.status).toBe('active');
    });

    test('TC-B22: Should support pending_reassignment status', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Reassignment Child',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'pending_reassignment',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.status).toBe('pending_reassignment');
    });

    test('TC-B23: Should support terminated status', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Terminated Child',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'terminated',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.status).toBe('terminated');
    });

    test('TC-B24: Should support graduated status', async () => {
      const beneficiaryData = {
        type: 'child',
        full_name: 'Graduated Child',
        date_of_birth: '2015-01-01',
        gender: 'male',
        guardian_id: testGuardian.id,
        status: 'graduated',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/beneficiaries')
        .send(beneficiaryData)
        .expect(201);

      expect(response.body.beneficiary.status).toBe('graduated');
    });
  });
});
