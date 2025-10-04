const request = require('supertest');
const { Sponsor, Address, UserCredentials, sequelize } = require('../models');

// Mock the app
const app = require('../server');

describe('Sponsor API Tests', () => {
  let testAddress;

  beforeAll(async () => {
    // Setup test database connection
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    // Cleanup and close connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Create a test address
    testAddress = await Address.create({
      country: 'Ethiopia',
      region: 'Addis Ababa',
      sub_region: 'Bole',
      woreda: 'Woreda 01',
      house_number: '123'
    });
  });

  afterEach(async () => {
    // Clean up test data
    await Sponsor.destroy({ where: { cluster_id: 'TS' } });
    await UserCredentials.destroy({ where: { sponsor_cluster_id: 'TS' } });
    if (testAddress) {
      await Address.destroy({ where: { id: testAddress.id } });
    }
  });

  describe('POST /api/sponsors - Create Sponsor', () => {
    test('TC-S01: Should create a new individual sponsor with all required fields', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0001',
        type: 'individual',
        full_name: 'John Doe',
        phone_number: '+251911234567',
        email: 'john.doe@example.com',
        date_of_birth: '1990-01-01',
        gender: 'male',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        address_id: testAddress.id,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      expect(response.body.message).toBe('Sponsor created successfully');
      expect(response.body.sponsor.cluster_id).toBe('TS');
      expect(response.body.sponsor.specific_id).toBe('0001');
      expect(response.body.sponsor.full_name).toBe('John Doe');
    });

    test('TC-S02: Should create sponsor without optional fields (email, date_of_birth, gender)', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0002',
        type: 'individual',
        full_name: 'Jane Smith',
        phone_number: '+251922345678',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      expect(response.body.sponsor.email).toBeNull();
      expect(response.body.sponsor.date_of_birth).toBeNull();
      expect(response.body.sponsor.gender).toBeNull();
    });

    test('TC-S03: Should create organization sponsor', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0003',
        type: 'organization',
        full_name: 'ABC Corporation',
        phone_number: '+251933456789',
        email: 'contact@abc.com',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 1500,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      expect(response.body.sponsor.type).toBe('organization');
      expect(response.body.sponsor.full_name).toBe('ABC Corporation');
    });

    test('TC-S04: Should create diaspora sponsor', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0004',
        type: 'individual',
        full_name: 'Michael Johnson',
        phone_number: '+14155551234',
        email: 'michael@example.com',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 1000,
        status: 'active',
        is_diaspora: true,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      expect(response.body.sponsor.is_diaspora).toBe(true);
    });

    test('TC-S05: Should create sponsor with pending_review status', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0005',
        type: 'individual',
        full_name: 'Sarah Williams',
        phone_number: '+251944567890',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'pending_review',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      expect(response.body.sponsor.status).toBe('pending_review');
    });

    test('TC-S06: Should create sponsor with consent document URL', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0006',
        type: 'individual',
        full_name: 'David Brown',
        phone_number: '+251955678901',
        consent_document_url: '/uploads/consent-123.pdf',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      expect(response.body.sponsor.consent_document_url).toBe('/uploads/consent-123.pdf');
    });

    test('TC-S07: Should create sponsor with emergency contact', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0007',
        type: 'individual',
        full_name: 'Emily Davis',
        phone_number: '+251966789012',
        emergency_contact_name: 'Robert Davis',
        emergency_contact_phone: '+251977890123',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      expect(response.body.sponsor.emergency_contact_name).toBe('Robert Davis');
      expect(response.body.sponsor.emergency_contact_phone).toBe('+251977890123');
    });

    test('TC-S08: Should fail when missing required field - cluster_id', async () => {
      const sponsorData = {
        specific_id: '0008',
        type: 'individual',
        full_name: 'Test User',
        phone_number: '+251988901234',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(400);

      expect(response.body.error).toContain('Missing required fields');
    });

    test('TC-S09: Should fail when missing required field - specific_id', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        type: 'individual',
        full_name: 'Test User',
        phone_number: '+251988901234',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(400);

      expect(response.body.error).toContain('Missing required fields');
    });

    test('TC-S10: Should fail when missing required field - full_name', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0010',
        type: 'individual',
        phone_number: '+251988901234',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(400);

      expect(response.body.error).toContain('Missing required fields');
    });

    test('TC-S11: Should fail when missing required field - phone_number', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0011',
        type: 'individual',
        full_name: 'Test User',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(400);

      expect(response.body.error).toContain('Missing required fields');
    });

    test('TC-S12: Should fail when sponsor ID already exists', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0012',
        type: 'individual',
        full_name: 'First User',
        phone_number: '+251999012345',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      // Create first sponsor
      await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(400);

      expect(response.body.error).toBe('Sponsor ID already exists');
    });

    test('TC-S13: Should auto-create user credentials with phone-based password', async () => {
      const sponsorData = {
        cluster_id: 'TS',
        specific_id: '0013',
        type: 'individual',
        full_name: 'Test User',
        phone_number: '+251911234567',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      };

      await request(app)
        .post('/api/sponsors')
        .send(sponsorData)
        .expect(201);

      // Verify user credentials were created
      const credentials = await UserCredentials.findOne({
        where: {
          sponsor_cluster_id: 'TS',
          sponsor_specific_id: '0013'
        }
      });

      expect(credentials).not.toBeNull();
      expect(credentials.phone_number).toBe('+251911234567');
      expect(credentials.role).toBe('sponsor');
      expect(credentials.is_active).toBe(true);
    });
  });

  describe('GET /api/sponsors - Get All Sponsors', () => {
    test('TC-S14: Should retrieve all active sponsors', async () => {
      // Create test sponsors
      await Sponsor.create({
        cluster_id: 'TS',
        specific_id: '0014',
        type: 'individual',
        full_name: 'Active Sponsor',
        phone_number: '+251911111111',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      });

      const response = await request(app)
        .get('/api/sponsors')
        .expect(200);

      expect(response.body.sponsors).toBeDefined();
      expect(Array.isArray(response.body.sponsors)).toBe(true);
    });

    test('TC-S15: Should filter sponsors by status', async () => {
      const response = await request(app)
        .get('/api/sponsors?status=pending_review')
        .expect(200);

      expect(response.body.sponsors).toBeDefined();
    });

    test('TC-S16: Should filter sponsors by type', async () => {
      const response = await request(app)
        .get('/api/sponsors?type=Individual')
        .expect(200);

      expect(response.body.sponsors).toBeDefined();
    });

    test('TC-S17: Should filter sponsors by residency', async () => {
      const response = await request(app)
        .get('/api/sponsors?residency=Diaspora')
        .expect(200);

      expect(response.body.sponsors).toBeDefined();
    });
  });

  describe('GET /api/sponsors/:cluster_id/:specific_id - Get Single Sponsor', () => {
    test('TC-S18: Should retrieve a specific sponsor by composite ID', async () => {
      await Sponsor.create({
        cluster_id: 'TS',
        specific_id: '0018',
        type: 'individual',
        full_name: 'Specific Sponsor',
        phone_number: '+251922222222',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      });

      const response = await request(app)
        .get('/api/sponsors/TS/0018/dashboard')
        .expect(200);

      expect(response.body.sponsor).toBeDefined();
      expect(response.body.sponsor.cluster_id).toBe('TS');
      expect(response.body.sponsor.specific_id).toBe('0018');
    });

    test('TC-S19: Should return 404 for non-existent sponsor', async () => {
      const response = await request(app)
        .get('/api/sponsors/XX/9999/dashboard')
        .expect(404);

      expect(response.body.error).toBe('Sponsor not found');
    });
  });

  describe('PUT /api/sponsors/:cluster_id/:specific_id - Update Sponsor', () => {
    test('TC-S20: Should update sponsor information', async () => {
      await Sponsor.create({
        cluster_id: 'TS',
        specific_id: '0020',
        type: 'individual',
        full_name: 'Original Name',
        phone_number: '+251933333333',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      });

      const updates = {
        full_name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/sponsors/TS/0020')
        .send(updates)
        .expect(200);

      expect(response.body.sponsor.full_name).toBe('Updated Name');
      expect(response.body.sponsor.email).toBe('updated@example.com');
    });

    test('TC-S21: Should update sponsor status', async () => {
      await Sponsor.create({
        cluster_id: 'TS',
        specific_id: '0021',
        type: 'individual',
        full_name: 'Status Test',
        phone_number: '+251944444444',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      });

      const updates = { status: 'inactive' };

      const response = await request(app)
        .put('/api/sponsors/TS/0021')
        .send(updates)
        .expect(200);

      expect(response.body.sponsor.status).toBe('inactive');
    });

    test('TC-S22: Should return 404 when updating non-existent sponsor', async () => {
      const updates = { full_name: 'New Name' };

      const response = await request(app)
        .put('/api/sponsors/XX/9999')
        .send(updates)
        .expect(404);

      expect(response.body.error).toBe('Sponsor not found');
    });
  });

  describe('DELETE /api/sponsors/:cluster_id/:specific_id - Delete Sponsor', () => {
    test('TC-S23: Should delete a sponsor', async () => {
      await Sponsor.create({
        cluster_id: 'TS',
        specific_id: '0023',
        type: 'individual',
        full_name: 'To Be Deleted',
        phone_number: '+251955555555',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      });

      const response = await request(app)
        .delete('/api/sponsors/TS/0023')
        .expect(200);

      expect(response.body.message).toBe('Sponsor deleted successfully');

      // Verify deletion
      const deletedSponsor = await Sponsor.findOne({
        where: { cluster_id: 'TS', specific_id: '0023' }
      });
      expect(deletedSponsor).toBeNull();
    });

    test('TC-S24: Should return 404 when deleting non-existent sponsor', async () => {
      const response = await request(app)
        .delete('/api/sponsors/XX/9999')
        .expect(404);

      expect(response.body.error).toBe('Sponsor not found');
    });
  });
});
