const request = require('supertest');
const { Sponsorship, Sponsor, Beneficiary, Guardian, Address, sequelize } = require('../models');

const app = require('../server');

describe('Sponsorship API Tests', () => {
  let testSponsor;
  let testBeneficiary;
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

    // Create test sponsor
    testSponsor = await Sponsor.create({
      cluster_id: 'SP',
      specific_id: '0001',
      type: 'individual',
      full_name: 'Test Sponsor',
      phone_number: '+251911111111',
      starting_date: '2025-01-01',
      agreed_monthly_payment: 750,
      status: 'active',
      is_diaspora: false,
      created_by: 1
    });

    // Create test guardian
    testGuardian = await Guardian.create({
      full_name: 'Test Guardian',
      phone_number: '+251922222222',
      relationship: 'parent',
      address_id: testAddress.id,
      created_by: 1
    });

    // Create test beneficiary
    testBeneficiary = await Beneficiary.create({
      type: 'child',
      full_name: 'Test Child',
      date_of_birth: '2015-01-01',
      gender: 'male',
      guardian_id: testGuardian.id,
      status: 'waiting_list',
      created_by: 1
    });
  });

  afterEach(async () => {
    await Sponsorship.destroy({ where: {} });
    await Beneficiary.destroy({ where: { id: testBeneficiary.id } });
    await Sponsor.destroy({ where: { cluster_id: 'SP' } });
    await Guardian.destroy({ where: { id: testGuardian.id } });
    await Address.destroy({ where: { id: testAddress.id } });
  });

  describe('POST /api/sponsorships - Create Sponsorship', () => {
    test('TC-SP01: Should create a sponsorship with all required fields', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      expect(response.body.sponsorship.sponsor_cluster_id).toBe('SP');
      expect(response.body.sponsorship.sponsor_specific_id).toBe('0001');
      expect(response.body.sponsorship.beneficiary_id).toBe(testBeneficiary.id);
      expect(response.body.sponsorship.status).toBe('active');
    });

    test('TC-SP02: Should create sponsorship with pending status', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'pending',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      expect(response.body.sponsorship.status).toBe('pending');
    });

    test('TC-SP03: Should create sponsorship with notes', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        notes: 'Special arrangement',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      expect(response.body.sponsorship.notes).toBe('Special arrangement');
    });

    test('TC-SP04: Should fail when missing required field - sponsor_cluster_id', async () => {
      const sponsorshipData = {
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-SP05: Should fail when missing required field - beneficiary_id', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('TC-SP06: Should fail when sponsor does not exist', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: 'XX',
        sponsor_specific_id: '9999',
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(404);

      expect(response.body.error).toContain('Sponsor not found');
    });

    test('TC-SP07: Should fail when beneficiary does not exist', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: 99999,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(404);

      expect(response.body.error).toContain('Beneficiary not found');
    });

    test('TC-SP08: Should update beneficiary status to active when sponsorship created', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      };

      await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      const updatedBeneficiary = await Beneficiary.findByPk(testBeneficiary.id);
      expect(updatedBeneficiary.status).toBe('active');
    });
  });

  describe('GET /api/sponsorships - Get All Sponsorships', () => {
    test('TC-SP09: Should retrieve all sponsorships', async () => {
      await Sponsorship.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/sponsorships')
        .expect(200);

      expect(response.body.sponsorships).toBeDefined();
      expect(Array.isArray(response.body.sponsorships)).toBe(true);
    });

    test('TC-SP10: Should filter sponsorships by status', async () => {
      const response = await request(app)
        .get('/api/sponsorships?status=active')
        .expect(200);

      expect(response.body.sponsorships).toBeDefined();
    });

    test('TC-SP11: Should filter sponsorships by sponsor', async () => {
      const response = await request(app)
        .get(`/api/sponsorships?sponsor_cluster_id=${testSponsor.cluster_id}&sponsor_specific_id=${testSponsor.specific_id}`)
        .expect(200);

      expect(response.body.sponsorships).toBeDefined();
    });

    test('TC-SP12: Should filter sponsorships by beneficiary', async () => {
      const response = await request(app)
        .get(`/api/sponsorships?beneficiary_id=${testBeneficiary.id}`)
        .expect(200);

      expect(response.body.sponsorships).toBeDefined();
    });
  });

  describe('GET /api/sponsorships/:id - Get Single Sponsorship', () => {
    test('TC-SP13: Should retrieve a specific sponsorship by ID', async () => {
      const sponsorship = await Sponsorship.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      });

      const response = await request(app)
        .get(`/api/sponsorships/${sponsorship.id}`)
        .expect(200);

      expect(response.body.id).toBe(sponsorship.id);
    });

    test('TC-SP14: Should return 404 for non-existent sponsorship', async () => {
      const response = await request(app)
        .get('/api/sponsorships/99999')
        .expect(404);

      expect(response.body.error).toBe('Sponsorship not found');
    });
  });

  describe('PUT /api/sponsorships/:id - Update Sponsorship', () => {
    test('TC-SP15: Should update sponsorship status', async () => {
      const sponsorship = await Sponsorship.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      });

      const updates = { status: 'terminated' };

      const response = await request(app)
        .put(`/api/sponsorships/${sponsorship.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.sponsorship.status).toBe('terminated');
    });

    test('TC-SP16: Should update sponsorship end_date', async () => {
      const sponsorship = await Sponsorship.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      });

      const updates = { 
        end_date: '2025-12-31',
        status: 'terminated'
      };

      const response = await request(app)
        .put(`/api/sponsorships/${sponsorship.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.sponsorship.end_date).toBe('2025-12-31');
    });

    test('TC-SP17: Should update sponsorship notes', async () => {
      const sponsorship = await Sponsorship.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      });

      const updates = { notes: 'Updated notes' };

      const response = await request(app)
        .put(`/api/sponsorships/${sponsorship.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.sponsorship.notes).toBe('Updated notes');
    });

    test('TC-SP18: Should return 404 when updating non-existent sponsorship', async () => {
      const updates = { status: 'terminated' };

      const response = await request(app)
        .put('/api/sponsorships/99999')
        .send(updates)
        .expect(404);

      expect(response.body.error).toBe('Sponsorship not found');
    });
  });

  describe('DELETE /api/sponsorships/:id - Delete Sponsorship', () => {
    test('TC-SP19: Should delete a sponsorship', async () => {
      const sponsorship = await Sponsorship.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      });

      const response = await request(app)
        .delete(`/api/sponsorships/${sponsorship.id}`)
        .expect(200);

      expect(response.body.message).toBe('Sponsorship deleted successfully');

      const deletedSponsorship = await Sponsorship.findByPk(sponsorship.id);
      expect(deletedSponsorship).toBeNull();
    });

    test('TC-SP20: Should return 404 when deleting non-existent sponsorship', async () => {
      const response = await request(app)
        .delete('/api/sponsorships/99999')
        .expect(404);

      expect(response.body.error).toBe('Sponsorship not found');
    });
  });

  describe('Sponsorship Status Tests', () => {
    test('TC-SP21: Should support active status', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'active',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      expect(response.body.sponsorship.status).toBe('active');
    });

    test('TC-SP22: Should support pending status', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'pending',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      expect(response.body.sponsorship.status).toBe('pending');
    });

    test('TC-SP23: Should support terminated status', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'terminated',
        end_date: '2025-12-31',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      expect(response.body.sponsorship.status).toBe('terminated');
    });

    test('TC-SP24: Should support completed status', async () => {
      const sponsorshipData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        beneficiary_id: testBeneficiary.id,
        start_date: '2025-01-01',
        status: 'completed',
        end_date: '2025-12-31',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsorships')
        .send(sponsorshipData)
        .expect(201);

      expect(response.body.sponsorship.status).toBe('completed');
    });
  });
});
