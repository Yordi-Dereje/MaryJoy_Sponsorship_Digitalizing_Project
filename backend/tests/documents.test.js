const request = require('supertest');
const { Document, Sponsor, sequelize } = require('../models');

// Mock the app
const app = require('../server');

describe('Document API Tests', () => {
  let testSponsor;

  beforeAll(async () => {
    // Setup test database connection
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    // Cleanup and close connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Create a test sponsor
    testSponsor = await Sponsor.create({
      cluster_id: 'TD',
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
    // Clean up test data
    await Document.destroy({ where: { sponsor_cluster_id: 'TD' } });
    await Sponsor.destroy({ where: { cluster_id: 'TD' } });
  });

  describe('POST /api/documents - Create Document', () => {
    test('TC-D01: Should create a consent document for a sponsor', async () => {
      const documentData = {
        title: 'Consent Document',
        type: 'consent_document',
        file_url: '/uploads/consent-123.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.title).toBe('Consent Document');
      expect(response.body.type).toBe('consent_document');
      expect(response.body.file_url).toBe('/uploads/consent-123.pdf');
      expect(response.body.sponsor_cluster_id).toBe('TD');
      expect(response.body.sponsor_specific_id).toBe('0001');
    });

    test('TC-D02: Should create document without title', async () => {
      const documentData = {
        type: 'id_card',
        file_url: '/uploads/id-card-456.jpg',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.type).toBe('id_card');
      expect(response.body.title).toBeNull();
    });

    test('TC-D03: Should create document with PDF file', async () => {
      const documentData = {
        title: 'Birth Certificate',
        type: 'birth_certificate',
        file_url: '/uploads/birth-cert-789.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.file_url).toContain('.pdf');
    });

    test('TC-D04: Should create document with image file', async () => {
      const documentData = {
        title: 'ID Card Photo',
        type: 'id_card',
        file_url: '/uploads/id-photo-101.jpg',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.file_url).toContain('.jpg');
    });

    test('TC-D05: Should create document with Word file', async () => {
      const documentData = {
        title: 'Agreement Document',
        type: 'agreement',
        file_url: '/uploads/agreement-202.docx',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.file_url).toContain('.docx');
    });

    test('TC-D06: Should create document for beneficiary', async () => {
      const documentData = {
        title: 'Beneficiary Birth Certificate',
        type: 'birth_certificate',
        file_url: '/uploads/beneficiary-birth-303.pdf',
        beneficiary_id: 1,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.beneficiary_id).toBe(1);
      expect(response.body.sponsor_cluster_id).toBeNull();
    });

    test('TC-D07: Should create document for guardian', async () => {
      const documentData = {
        title: 'Guardian ID Card',
        type: 'id_card',
        file_url: '/uploads/guardian-id-404.jpg',
        guardian_id: 1,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.guardian_id).toBe(1);
    });

    test('TC-D08: Should create multiple documents for same sponsor', async () => {
      const doc1 = {
        title: 'Consent Document',
        type: 'consent_document',
        file_url: '/uploads/consent-501.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const doc2 = {
        title: 'ID Card',
        type: 'id_card',
        file_url: '/uploads/id-502.jpg',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response1 = await request(app)
        .post('/api/documents')
        .send(doc1)
        .expect(201);

      const response2 = await request(app)
        .post('/api/documents')
        .send(doc2)
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);
      expect(response1.body.sponsor_cluster_id).toBe(response2.body.sponsor_cluster_id);
    });

    test('TC-D09: Should fail when missing required field - type', async () => {
      const documentData = {
        title: 'Test Document',
        file_url: '/uploads/test-601.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    test('TC-D10: Should fail when missing required field - file_url', async () => {
      const documentData = {
        title: 'Test Document',
        type: 'consent_document',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    test('TC-D11: Should create document with all entity references null', async () => {
      const documentData = {
        title: 'General Document',
        type: 'other',
        file_url: '/uploads/general-701.pdf',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.sponsor_cluster_id).toBeNull();
      expect(response.body.beneficiary_id).toBeNull();
      expect(response.body.guardian_id).toBeNull();
    });

    test('TC-D12: Should create document with timestamp', async () => {
      const documentData = {
        title: 'Timestamped Document',
        type: 'consent_document',
        file_url: '/uploads/timestamp-801.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.created_at).toBeDefined();
      expect(response.body.updated_at).toBeDefined();
    });
  });

  describe('GET /api/documents - Get All Documents', () => {
    test('TC-D13: Should retrieve all documents', async () => {
      // Create test documents
      await Document.create({
        title: 'Document 1',
        type: 'consent_document',
        file_url: '/uploads/doc1.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      });

      await Document.create({
        title: 'Document 2',
        type: 'id_card',
        file_url: '/uploads/doc2.jpg',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body.total).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(response.body.documents)).toBe(true);
    });

    test('TC-D14: Should return empty array when no documents exist', async () => {
      // Clean all documents first
      await Document.destroy({ where: {} });

      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.documents).toEqual([]);
    });

    test('TC-D15: Should return documents ordered by created_at DESC', async () => {
      // Create documents with delay
      const doc1 = await Document.create({
        title: 'First Document',
        type: 'consent_document',
        file_url: '/uploads/first.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      });

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      const doc2 = await Document.create({
        title: 'Second Document',
        type: 'id_card',
        file_url: '/uploads/second.jpg',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      // Most recent should be first
      const firstDoc = response.body.documents[0];
      expect(firstDoc.title).toBe('Second Document');
    });
  });

  describe('GET /api/documents/sponsor/:cluster_id/:specific_id - Get Sponsor Documents', () => {
    test('TC-D16: Should retrieve all documents for a specific sponsor', async () => {
      // Create documents for the sponsor
      await Document.create({
        title: 'Sponsor Doc 1',
        type: 'consent_document',
        file_url: '/uploads/sponsor-doc1.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      });

      await Document.create({
        title: 'Sponsor Doc 2',
        type: 'id_card',
        file_url: '/uploads/sponsor-doc2.jpg',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/documents/sponsor/TD/0001')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].sponsor_cluster_id).toBe('TD');
      expect(response.body[0].sponsor_specific_id).toBe('0001');
    });

    test('TC-D17: Should return empty array for sponsor with no documents', async () => {
      const response = await request(app)
        .get('/api/documents/sponsor/TD/9999')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('TC-D18: Should not return documents from other sponsors', async () => {
      // Create another sponsor
      await Sponsor.create({
        cluster_id: 'TD',
        specific_id: '0002',
        type: 'individual',
        full_name: 'Another Sponsor',
        phone_number: '+251922222222',
        starting_date: '2025-01-01',
        agreed_monthly_payment: 750,
        status: 'active',
        is_diaspora: false,
        created_by: 1
      });

      // Create document for first sponsor
      await Document.create({
        title: 'Sponsor 1 Doc',
        type: 'consent_document',
        file_url: '/uploads/s1-doc.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      });

      // Create document for second sponsor
      await Document.create({
        title: 'Sponsor 2 Doc',
        type: 'consent_document',
        file_url: '/uploads/s2-doc.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0002',
        created_by: 1
      });

      const response = await request(app)
        .get('/api/documents/sponsor/TD/0001')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Sponsor 1 Doc');
    });
  });

  describe('GET /api/documents/beneficiary/:beneficiary_id - Get Beneficiary Documents', () => {
    test('TC-D19: Should retrieve all documents for a specific beneficiary', async () => {
      await Document.create({
        title: 'Beneficiary Doc 1',
        type: 'birth_certificate',
        file_url: '/uploads/ben-doc1.pdf',
        beneficiary_id: 1,
        created_by: 1
      });

      await Document.create({
        title: 'Beneficiary Doc 2',
        type: 'medical_record',
        file_url: '/uploads/ben-doc2.pdf',
        beneficiary_id: 1,
        created_by: 1
      });

      const response = await request(app)
        .get('/api/documents/beneficiary/1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].beneficiary_id).toBe(1);
    });

    test('TC-D20: Should return empty array for beneficiary with no documents', async () => {
      const response = await request(app)
        .get('/api/documents/beneficiary/9999')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Document Type Tests', () => {
    test('TC-D21: Should support consent_document type', async () => {
      const documentData = {
        title: 'Consent',
        type: 'consent_document',
        file_url: '/uploads/consent.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.type).toBe('consent_document');
    });

    test('TC-D22: Should support birth_certificate type', async () => {
      const documentData = {
        title: 'Birth Certificate',
        type: 'birth_certificate',
        file_url: '/uploads/birth.pdf',
        beneficiary_id: 1,
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.type).toBe('birth_certificate');
    });

    test('TC-D23: Should support id_card type', async () => {
      const documentData = {
        title: 'ID Card',
        type: 'id_card',
        file_url: '/uploads/id.jpg',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.type).toBe('id_card');
    });

    test('TC-D24: Should support custom document types', async () => {
      const documentData = {
        title: 'Custom Document',
        type: 'custom_type',
        file_url: '/uploads/custom.pdf',
        sponsor_cluster_id: 'TD',
        sponsor_specific_id: '0001',
        created_by: 1
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);

      expect(response.body.type).toBe('custom_type');
    });
  });
});
