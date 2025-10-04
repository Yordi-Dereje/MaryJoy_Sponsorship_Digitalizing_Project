# Test Suite - Quick Start Guide

## Installation

First, install the required testing dependencies:

```bash
cd backend
npm install --save-dev jest supertest
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Run only sponsor tests
npm run test:sponsors

# Run only document tests
npm run test:documents
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## Test Files

- **`sponsors.test.js`** - 24 test cases for Sponsor API endpoints
- **`documents.test.js`** - 24 test cases for Document API endpoints
- **`setup.js`** - Test environment configuration
- **`TEST_DOCUMENTATION.md`** - Comprehensive test documentation

## Test Coverage

### Sponsor Tests (24 cases)
- ✅ Create sponsor with all fields
- ✅ Create sponsor with minimal fields
- ✅ Create organization sponsor
- ✅ Create diaspora sponsor
- ✅ Validation tests (missing required fields)
- ✅ Duplicate ID handling
- ✅ User credentials auto-creation
- ✅ Get all sponsors
- ✅ Filter sponsors
- ✅ Get single sponsor
- ✅ Update sponsor
- ✅ Delete sponsor

### Document Tests (24 cases)
- ✅ Create document for sponsor
- ✅ Create document for beneficiary
- ✅ Create document for guardian
- ✅ Multiple file types (PDF, JPG, DOCX)
- ✅ Multiple document types
- ✅ Get all documents
- ✅ Get sponsor documents
- ✅ Get beneficiary documents
- ✅ Validation tests
- ✅ Ordering and filtering

## Test Structure

Each test file follows this structure:

```javascript
describe('API Endpoint', () => {
  beforeAll(async () => {
    // Setup database connection
  });

  afterAll(async () => {
    // Close database connection
  });

  beforeEach(async () => {
    // Create test data
  });

  afterEach(async () => {
    // Clean up test data
  });

  describe('Specific Feature', () => {
    test('TC-XXX: Test case description', async () => {
      // Test implementation
    });
  });
});
```

## Test Database

### Important Notes
- Tests use the same database as development by default
- Consider creating a separate test database
- Tests clean up after themselves using `afterEach` hooks
- Test data uses prefix 'TS' (Test Sponsor) or 'TD' (Test Document)

### Creating a Test Database (Recommended)

1. Create a test database:
```sql
CREATE DATABASE mary_joy_ethiopia_test;
```

2. Update `.env.test` file:
```env
DB_NAME=mary_joy_ethiopia_test
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

3. Run tests with test environment:
```bash
NODE_ENV=test npm test
```

## Troubleshooting

### Tests Failing to Connect to Database
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### Tests Timing Out
- Increase Jest timeout in `jest.config.js`
- Check database connection speed
- Ensure no hanging connections

### Tests Failing Due to Existing Data
- Clean up test data manually:
```sql
DELETE FROM sponsors WHERE cluster_id = 'TS';
DELETE FROM documents WHERE sponsor_cluster_id = 'TD';
```

### Port Already in Use
- Stop the development server before running tests
- Or configure tests to use a different port

## Writing New Tests

### Template for New Test
```javascript
test('TC-XXX: Description of what is being tested', async () => {
  // Arrange - Set up test data
  const testData = {
    // ... test data
  };

  // Act - Perform the action
  const response = await request(app)
    .post('/api/endpoint')
    .send(testData)
    .expect(201);

  // Assert - Verify the results
  expect(response.body.field).toBe('expected value');
});
```

### Best Practices
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Clean up test data in `afterEach`
4. Use unique test IDs (TC-XXX)
5. Test both success and failure cases
6. Keep tests independent
7. Don't rely on test execution order

## Continuous Integration

### GitHub Actions Example
Add `.github/workflows/test.yml`:

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
          POSTGRES_DB: mary_joy_ethiopia_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: mary_joy_ethiopia_test
          DB_USER: postgres
          DB_PASSWORD: postgres
```

## Coverage Reports

After running `npm run test:coverage`, view the coverage report:

```bash
# Open coverage report in browser
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
xdg-open coverage/lcov-report/index.html # Linux
```

## Test Summary

| Category | Total Tests | Status |
|----------|-------------|--------|
| Sponsor API | 24 | ✅ Ready |
| Document API | 24 | ✅ Ready |
| **Total** | **48** | **✅ Ready** |

## Next Steps

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Review test documentation: `TEST_DOCUMENTATION.md`
4. Add new tests as features are developed
5. Set up CI/CD pipeline

## Support

For questions or issues:
- Review `TEST_DOCUMENTATION.md` for detailed test cases
- Check test output for specific error messages
- Ensure database is properly configured
- Verify all dependencies are installed

---

**Last Updated**: 2025-10-04
**Test Framework**: Jest v29.7.0
**Total Test Cases**: 48
