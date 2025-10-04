const request = require('supertest');
const { SponsorRequest, Sponsor, sequelize } = require('../models');

const app = require('../server');

describe('Sponsor Request API Tests', () => {
  let testSponsor;

  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    testSponsor = await Sponsor.create({
      cluster_id: 'SR',
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
  });

  afterEach(async () => {
    await SponsorRequest.destroy({ where: {} });
    await Sponsor.destroy({ where: { cluster_id: 'SR' } });
  });

  describe('POST /api/sponsor-requests - Create Sponsor Request', () => {
    test('TC-SR01: Should create sponsor request for children', async () => {
      const requestData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 2,
        number_of_elderly_beneficiaries: 0,
        total_beneficiaries: 2,
        status: 'pending',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 1500,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsor-requests')
        .send(requestData)
        .expect(201);

      expect(response.body.request.number_of_child_beneficiaries).toBe(2);
      expect(response.body.request.total_beneficiaries).toBe(2);
    });

    test('TC-SR02: Should create sponsor request for elderly', async () => {
      const requestData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 0,
        number_of_elderly_beneficiaries: 1,
        total_beneficiaries: 1,
        status: 'pending',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 750,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsor-requests')
        .send(requestData)
        .expect(201);

      expect(response.body.request.number_of_elderly_beneficiaries).toBe(1);
    });

    test('TC-SR03: Should create sponsor request for both children and elderly', async () => {
      const requestData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 1,
        number_of_elderly_beneficiaries: 1,
        total_beneficiaries: 2,
        status: 'pending',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 1500,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsor-requests')
        .send(requestData)
        .expect(201);

      expect(response.body.request.number_of_child_beneficiaries).toBe(1);
      expect(response.body.request.number_of_elderly_beneficiaries).toBe(1);
      expect(response.body.request.total_beneficiaries).toBe(2);
    });

    test('TC-SR04: Should create request with notes', async () => {
      const requestData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 1,
        number_of_elderly_beneficiaries: 0,
        total_beneficiaries: 1,
        status: 'pending',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 750,
        notes: 'Prefer local beneficiary',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsor-requests')
        .send(requestData)
        .expect(201);

      expect(response.body.request.notes).toBe('Prefer local beneficiary');
    });

    test('TC-SR05: Should fail when missing required field', async () => {
      const requestData = {
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 1,
        status: 'pending',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsor-requests')
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/sponsor-requests - Get All Requests', () => {
    test('TC-SR06: Should retrieve all sponsor requests', async () => {
      await SponsorRequest.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 1,
        number_of_elderly_beneficiaries: 0,
        total_beneficiaries: 1,
        status: 'pending',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 750,
        created_by: 1
      });

      const response = await request(app)
        .get('/api/sponsor-requests')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('TC-SR07: Should filter requests by status', async () => {
      const response = await request(app)
        .get('/api/sponsor-requests?status=pending')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('TC-SR08: Should filter requests by sponsor', async () => {
      const response = await request(app)
        .get(`/api/sponsor-requests?sponsor_cluster_id=${testSponsor.cluster_id}&sponsor_specific_id=${testSponsor.specific_id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/sponsor-requests/:id - Update Request', () => {
    test('TC-SR09: Should update request status to approved', async () => {
      const sponsorRequest = await SponsorRequest.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 1,
        number_of_elderly_beneficiaries: 0,
        total_beneficiaries: 1,
        status: 'pending',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 750,
        created_by: 1
      });

      const updates = { status: 'approved' };

      const response = await request(app)
        .put(`/api/sponsor-requests/${sponsorRequest.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.request.status).toBe('approved');
    });

    test('TC-SR10: Should update request status to fulfilled', async () => {
      const sponsorRequest = await SponsorRequest.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 1,
        number_of_elderly_beneficiaries: 0,
        total_beneficiaries: 1,
        status: 'approved',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 750,
        created_by: 1
      });

      const updates = { status: 'fulfilled' };

      const response = await request(app)
        .put(`/api/sponsor-requests/${sponsorRequest.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.request.status).toBe('fulfilled');
    });
  });

  describe('DELETE /api/sponsor-requests/:id - Delete Request', () => {
    test('TC-SR11: Should delete a sponsor request', async () => {
      const sponsorRequest = await SponsorRequest.create({
        sponsor_cluster_id: testSponsor.cluster_id,
        sponsor_specific_id: testSponsor.specific_id,
        number_of_child_beneficiaries: 1,
        number_of_elderly_beneficiaries: 0,
        total_beneficiaries: 1,
        status: 'pending',
        request_date: '2025-01-01',
        estimated_monthly_commitment: 750,
        created_by: 1
      });

      const response = await request(app)
        .delete(`/api/sponsor-requests/${sponsorRequest.id}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
    });

    test('TC-SR12: Should return 404 when deleting non-existent request', async () => {
      const response = await request(app)
        .delete('/api/sponsor-requests/99999')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });
});
