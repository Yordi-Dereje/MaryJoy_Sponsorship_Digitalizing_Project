# Test Documentation

## Overview
This document provides comprehensive test cases for the Sponsor and Document management system.

## Test Environment Setup

### Prerequisites
- Node.js installed
- PostgreSQL database running
- Test database configured

### Installation
```bash
npm install --save-dev jest supertest
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test sponsors.test.js
npm test documents.test.js

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

---

## Sponsor API Test Cases

### Test Suite: POST /api/sponsors - Create Sponsor

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-S01 | Create individual sponsor with all required fields | 201 Created, sponsor object returned | ✅ |
| TC-S02 | Create sponsor without optional fields (email, DOB, gender) | 201 Created, optional fields are null | ✅ |
| TC-S03 | Create organization sponsor | 201 Created, type is 'organization' | ✅ |
| TC-S04 | Create diaspora sponsor | 201 Created, is_diaspora is true | ✅ |
| TC-S05 | Create sponsor with pending_review status | 201 Created, status is 'pending_review' | ✅ |
| TC-S06 | Create sponsor with consent document URL | 201 Created, consent_document_url saved | ✅ |
| TC-S07 | Create sponsor with emergency contact | 201 Created, emergency contact saved | ✅ |
| TC-S08 | Missing required field - cluster_id | 400 Bad Request, error message | ✅ |
| TC-S09 | Missing required field - specific_id | 400 Bad Request, error message | ✅ |
| TC-S10 | Missing required field - full_name | 400 Bad Request, error message | ✅ |
| TC-S11 | Missing required field - phone_number | 400 Bad Request, error message | ✅ |
| TC-S12 | Duplicate sponsor ID | 400 Bad Request, 'Sponsor ID already exists' | ✅ |
| TC-S13 | Auto-create user credentials | 201 Created, UserCredentials created with phone-based password | ✅ |

### Test Suite: GET /api/sponsors - Get All Sponsors

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-S14 | Retrieve all active sponsors | 200 OK, array of sponsors | ✅ |
| TC-S15 | Filter sponsors by status | 200 OK, filtered sponsors | ✅ |
| TC-S16 | Filter sponsors by type | 200 OK, filtered sponsors | ✅ |
| TC-S17 | Filter sponsors by residency | 200 OK, filtered sponsors | ✅ |

### Test Suite: GET /api/sponsors/:cluster_id/:specific_id - Get Single Sponsor

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-S18 | Retrieve specific sponsor by composite ID | 200 OK, sponsor object with dashboard data | ✅ |
| TC-S19 | Non-existent sponsor | 404 Not Found, 'Sponsor not found' | ✅ |

### Test Suite: PUT /api/sponsors/:cluster_id/:specific_id - Update Sponsor

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-S20 | Update sponsor information | 200 OK, updated sponsor object | ✅ |
| TC-S21 | Update sponsor status | 200 OK, status updated | ✅ |
| TC-S22 | Update non-existent sponsor | 404 Not Found, 'Sponsor not found' | ✅ |

### Test Suite: DELETE /api/sponsors/:cluster_id/:specific_id - Delete Sponsor

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-S23 | Delete a sponsor | 200 OK, 'Sponsor deleted successfully' | ✅ |
| TC-S24 | Delete non-existent sponsor | 404 Not Found, 'Sponsor not found' | ✅ |

---

## Document API Test Cases

### Test Suite: POST /api/documents - Create Document

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-D01 | Create consent document for sponsor | 201 Created, document object returned | ✅ |
| TC-D02 | Create document without title | 201 Created, title is null | ✅ |
| TC-D03 | Create document with PDF file | 201 Created, file_url contains .pdf | ✅ |
| TC-D04 | Create document with image file | 201 Created, file_url contains .jpg | ✅ |
| TC-D05 | Create document with Word file | 201 Created, file_url contains .docx | ✅ |
| TC-D06 | Create document for beneficiary | 201 Created, beneficiary_id set | ✅ |
| TC-D07 | Create document for guardian | 201 Created, guardian_id set | ✅ |
| TC-D08 | Create multiple documents for same sponsor | 201 Created for each, different IDs | ✅ |
| TC-D09 | Missing required field - type | 500 Internal Server Error | ✅ |
| TC-D10 | Missing required field - file_url | 500 Internal Server Error | ✅ |
| TC-D11 | Create document with all entity references null | 201 Created, all entity fields null | ✅ |
| TC-D12 | Create document with timestamp | 201 Created, created_at and updated_at set | ✅ |

### Test Suite: GET /api/documents - Get All Documents

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-D13 | Retrieve all documents | 200 OK, array of documents with total count | ✅ |
| TC-D14 | No documents exist | 200 OK, empty array, total is 0 | ✅ |
| TC-D15 | Documents ordered by created_at DESC | 200 OK, most recent first | ✅ |

### Test Suite: GET /api/documents/sponsor/:cluster_id/:specific_id - Get Sponsor Documents

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-D16 | Retrieve all documents for specific sponsor | 200 OK, array of sponsor's documents | ✅ |
| TC-D17 | Sponsor with no documents | 200 OK, empty array | ✅ |
| TC-D18 | Should not return documents from other sponsors | 200 OK, only requested sponsor's documents | ✅ |

### Test Suite: GET /api/documents/beneficiary/:beneficiary_id - Get Beneficiary Documents

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-D19 | Retrieve all documents for specific beneficiary | 200 OK, array of beneficiary's documents | ✅ |
| TC-D20 | Beneficiary with no documents | 200 OK, empty array | ✅ |

### Test Suite: Document Type Tests

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC-D21 | Support consent_document type | 201 Created, type is 'consent_document' | ✅ |
| TC-D22 | Support birth_certificate type | 201 Created, type is 'birth_certificate' | ✅ |
| TC-D23 | Support id_card type | 201 Created, type is 'id_card' | ✅ |
| TC-D24 | Support custom document types | 201 Created, custom type accepted | ✅ |

---

## Test Data Examples

### Valid Sponsor Data
```json
{
  "cluster_id": "01",
  "specific_id": "0001",
  "type": "individual",
  "full_name": "John Doe",
  "phone_number": "+251911234567",
  "email": "john.doe@example.com",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "starting_date": "2025-01-01",
  "agreed_monthly_payment": 750,
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+251922345678",
  "status": "active",
  "is_diaspora": false,
  "address_id": 1,
  "created_by": 1
}
```

### Valid Document Data
```json
{
  "title": "Consent Document",
  "type": "consent_document",
  "file_url": "/uploads/consent-123.pdf",
  "sponsor_cluster_id": "01",
  "sponsor_specific_id": "0001",
  "created_by": 1
}
```

---

## Error Scenarios

### Sponsor Creation Errors
1. **Missing Required Fields**: Returns 400 with error message specifying missing fields
2. **Duplicate ID**: Returns 400 with "Sponsor ID already exists"
3. **Invalid Type**: Database constraint violation
4. **Invalid Status**: Database constraint violation
5. **Invalid Gender**: Database constraint violation

### Document Creation Errors
1. **Missing Type**: Returns 500 with error message
2. **Missing File URL**: Returns 500 with error message
3. **Invalid Entity Reference**: Foreign key constraint violation (if enforced)

---

## Integration Test Scenarios

### Scenario 1: Complete Sponsor Registration Flow
1. Create address (if needed)
2. Upload consent document file
3. Create sponsor with document URL
4. Create document record
5. Create sponsor request (optional)
6. Verify sponsor appears in list
7. Verify document appears in sponsor's documents

### Scenario 2: Update Sponsor with New Document
1. Retrieve existing sponsor
2. Upload new document file
3. Create new document record
4. Update sponsor information
5. Verify both documents exist for sponsor

### Scenario 3: Sponsor Deletion
1. Create sponsor with documents
2. Delete sponsor
3. Verify sponsor is deleted
4. Verify associated documents handling (cascade or orphan)

---

## Performance Considerations

### Expected Response Times
- Create Sponsor: < 500ms
- Get All Sponsors: < 1000ms (for 100 records)
- Get Single Sponsor: < 200ms
- Create Document: < 300ms
- Get Documents: < 500ms

### Load Testing Recommendations
- Test with 1000+ sponsors
- Test with 10000+ documents
- Test concurrent sponsor creation
- Test concurrent document uploads

---

## Test Coverage Goals

- **Line Coverage**: > 80%
- **Branch Coverage**: > 70%
- **Function Coverage**: > 80%
- **Statement Coverage**: > 80%

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## Manual Testing Checklist

### Sponsor Creation
- [ ] Create individual sponsor with all fields
- [ ] Create individual sponsor with minimal fields
- [ ] Create organization sponsor
- [ ] Create diaspora sponsor
- [ ] Create local sponsor
- [ ] Upload and attach consent document
- [ ] Verify user credentials created
- [ ] Verify sponsor appears in list
- [ ] Verify sponsor dashboard loads

### Document Management
- [ ] Upload PDF document
- [ ] Upload image document
- [ ] Upload Word document
- [ ] Create document record
- [ ] View document in sponsor profile
- [ ] View document in documents list
- [ ] Download document
- [ ] Delete document (if implemented)

### Edge Cases
- [ ] Very long sponsor names (255 characters)
- [ ] International phone numbers
- [ ] Special characters in names
- [ ] Large file uploads (near 10MB limit)
- [ ] Multiple documents same sponsor
- [ ] Sponsor with no documents
- [ ] Document with no sponsor

---

## Bug Reporting Template

```markdown
### Bug Report

**Test Case ID**: TC-XXX
**Severity**: Critical/High/Medium/Low
**Environment**: Development/Staging/Production

**Description**:
[Clear description of the issue]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Logs**:
[Attach relevant screenshots or error logs]

**Additional Context**:
[Any other relevant information]
```

---

## Maintenance

### Updating Tests
- Update tests when API changes
- Add new tests for new features
- Remove obsolete tests
- Keep test data realistic

### Test Database
- Use separate test database
- Reset database between test runs
- Use transactions for test isolation
- Clean up test data after runs

---

## Contact

For questions or issues with tests, contact the development team.

**Last Updated**: 2025-10-04
**Version**: 1.0.0
