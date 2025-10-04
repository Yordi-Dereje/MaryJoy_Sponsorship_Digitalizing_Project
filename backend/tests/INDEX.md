# Test Suite Index

## 📚 Documentation Files

| File | Description | Purpose |
|------|-------------|---------|
| **README.md** | Quick Start Guide | Get started with testing quickly |
| **COMPLETE_TEST_SUMMARY.md** | Complete Overview | Full test suite documentation |
| **TEST_DOCUMENTATION.md** | Detailed Test Docs | In-depth test case documentation |
| **INDEX.md** | This File | Navigation and overview |

---

## 🧪 Test Files (168 Total Tests)

### Core Entity Tests

| # | Test File | Tests | Description |
|---|-----------|-------|-------------|
| 1 | `sponsors.test.js` | 24 | Sponsor CRUD operations, validation, user credentials |
| 2 | `documents.test.js` | 24 | Document management for all entities |
| 3 | `beneficiaries.test.js` | 24 | Child & elderly beneficiary management |
| 4 | `guardians.test.js` | 20 | Guardian management and relationships |
| 5 | `employees.test.js` | 20 | Employee management and roles |
| 6 | `sponsorships.test.js` | 24 | Sponsorship relationships and lifecycle |
| 7 | `auth.test.js` | 20 | Authentication, login, password management |
| 8 | `sponsorRequests.test.js` | 12 | Sponsor beneficiary requests |

---

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific module
npm run test:sponsors
npm run test:documents
npm run test:beneficiaries
npm run test:guardians
npm run test:employees
npm run test:sponsorships
npm run test:auth
npm run test:requests

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📊 Test Coverage by Category

### 1. Sponsors (24 tests)
- **Create**: 13 tests (validation, types, credentials)
- **Read**: 4 tests (list, filter, single)
- **Update**: 3 tests (info, status, errors)
- **Delete**: 2 tests (success, errors)
- **Special**: 2 tests (auto-credentials, duplicates)

### 2. Documents (24 tests)
- **Create**: 12 tests (types, entities, validation)
- **Read**: 8 tests (all, by entity, ordering)
- **Types**: 4 tests (consent, birth cert, ID, custom)

### 3. Beneficiaries (24 tests)
- **Create Child**: 5 tests (full, medical, school, validation)
- **Create Elderly**: 2 tests (basic, medical)
- **Read**: 7 tests (all, filter, search, single)
- **Update**: 3 tests (info, status, errors)
- **Delete**: 2 tests (success, errors)
- **Status**: 5 tests (all status types)

### 4. Guardians (20 tests)
- **Create**: 9 tests (relationships, contacts, validation)
- **Read**: 4 tests (all, filter, search, single)
- **Update**: 3 tests (info, relationship, errors)
- **Delete**: 2 tests (success, errors)
- **Relations**: 2 tests (with beneficiaries)

### 5. Employees (20 tests)
- **Create**: 9 tests (roles, credentials, validation)
- **Read**: 5 tests (all, filter, search, single)
- **Update**: 3 tests (info, status, errors)
- **Delete**: 2 tests (success, errors)
- **Special**: 1 test (duplicate email)

### 6. Sponsorships (24 tests)
- **Create**: 8 tests (full, status, validation, references)
- **Read**: 5 tests (all, filter, single)
- **Update**: 4 tests (status, dates, notes, errors)
- **Delete**: 2 tests (success, errors)
- **Status**: 5 tests (all status types)

### 7. Authentication (20 tests)
- **Employee Login**: 6 tests (valid, invalid, missing, inactive)
- **Sponsor Login**: 4 tests (valid, invalid, missing)
- **Password Change**: 3 tests (success, wrong password, not found)
- **Password Reset**: 3 tests (employee, sponsor, not found)
- **JWT & Roles**: 4 tests (token validation, role checks)

### 8. Sponsor Requests (12 tests)
- **Create**: 5 tests (children, elderly, both, notes, validation)
- **Read**: 3 tests (all, filter by status, filter by sponsor)
- **Update**: 2 tests (approve, fulfill)
- **Delete**: 2 tests (success, errors)

---

## 🎯 Test ID Reference

### Format
`TC-[MODULE][NUMBER]`

### Modules
- **S**: Sponsors (TC-S01 to TC-S24)
- **D**: Documents (TC-D01 to TC-D24)
- **B**: Beneficiaries (TC-B01 to TC-B24)
- **G**: Guardians (TC-G01 to TC-G20)
- **E**: Employees (TC-E01 to TC-E20)
- **SP**: Sponsorships (TC-SP01 to TC-SP24)
- **A**: Authentication (TC-A01 to TC-A20)
- **SR**: Sponsor Requests (TC-SR01 to TC-SR12)

---

## 📁 File Structure

```
backend/
├── tests/
│   ├── INDEX.md                      ← You are here
│   ├── README.md                     ← Quick start
│   ├── COMPLETE_TEST_SUMMARY.md      ← Full overview
│   ├── TEST_DOCUMENTATION.md         ← Detailed docs
│   ├── setup.js                      ← Test configuration
│   ├── sponsors.test.js              ← 24 tests
│   ├── documents.test.js             ← 24 tests
│   ├── beneficiaries.test.js         ← 24 tests
│   ├── guardians.test.js             ← 20 tests
│   ├── employees.test.js             ← 20 tests
│   ├── sponsorships.test.js          ← 24 tests
│   ├── auth.test.js                  ← 20 tests
│   └── sponsorRequests.test.js       ← 12 tests
├── jest.config.js                    ← Jest configuration
└── package.json                      ← Test scripts
```

---

## 🔍 Finding Specific Tests

### By Feature
- **User Management**: `auth.test.js`, `employees.test.js`
- **Sponsor Management**: `sponsors.test.js`, `sponsorRequests.test.js`
- **Beneficiary Management**: `beneficiaries.test.js`, `guardians.test.js`
- **Relationships**: `sponsorships.test.js`
- **Documents**: `documents.test.js`

### By Operation
- **Create (POST)**: All test files have create sections
- **Read (GET)**: All test files have read sections
- **Update (PUT)**: All test files have update sections
- **Delete (DELETE)**: All test files have delete sections

### By Status Code
- **200 OK**: Success responses in all files
- **201 Created**: Create operations in all files
- **400 Bad Request**: Validation tests in all files
- **401 Unauthorized**: `auth.test.js`
- **404 Not Found**: Single entity tests in all files
- **500 Internal Server Error**: Error handling tests

---

## 📈 Test Metrics

### Total Statistics
- **Total Test Files**: 8
- **Total Test Cases**: 168
- **Total Test Suites**: 8
- **Average Tests per File**: 21

### Coverage Goals
- **Line Coverage**: > 80%
- **Branch Coverage**: > 70%
- **Function Coverage**: > 80%
- **Statement Coverage**: > 80%

### Performance Targets
- **Single Test**: < 500ms
- **Test Suite**: < 60s
- **Full Test Run**: < 5min

---

## 🛠️ Configuration Files

### `jest.config.js`
```javascript
{
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageThreshold: { global: { branches: 50, functions: 50, lines: 50, statements: 50 } }
}
```

### `tests/setup.js`
- Database connection setup
- Global timeout: 30 seconds
- Before/after hooks

---

## 📝 Test Writing Guidelines

### Structure
```javascript
describe('Feature', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup test data
  });

  test('TC-XX##: Description', async () => {
    // Arrange
    const data = { ... };

    // Act
    const response = await request(app)
      .post('/api/endpoint')
      .send(data)
      .expect(201);

    // Assert
    expect(response.body.field).toBe('value');
  });
});
```

### Best Practices
1. ✅ Use descriptive test names
2. ✅ Follow AAA pattern (Arrange, Act, Assert)
3. ✅ Clean up in `afterEach`
4. ✅ Use unique test IDs
5. ✅ Test both success and failure
6. ✅ Keep tests independent
7. ✅ Don't rely on execution order

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check PostgreSQL running, verify `.env` |
| Tests timeout | Increase timeout in `jest.config.js` |
| Port already in use | Stop dev server before tests |
| Test data conflicts | Use unique prefixes, check cleanup |
| Module not found | Run `npm install` |

### Debug Commands
```bash
# Verbose output
npm test -- --verbose

# Run single test
npm test -- --testNamePattern="TC-S01"

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Clear cache
npm test -- --clearCache
```

---

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Sequelize Testing](https://sequelize.org/docs/v6/other-topics/testing/)

### Related Files
- `../routes/`: API route implementations
- `../models/`: Database models
- `../config/database.js`: Database configuration

---

## 🎓 Learning Path

### For New Developers
1. Read `README.md` for quick start
2. Run `npm test` to see all tests
3. Read `COMPLETE_TEST_SUMMARY.md` for overview
4. Study one test file (start with `sponsors.test.js`)
5. Write a new test following the pattern

### For Contributors
1. Review existing tests before adding new ones
2. Follow naming conventions
3. Update documentation when adding tests
4. Ensure all tests pass before committing
5. Maintain test coverage above 80%

---

## ✅ Checklist

### Before Running Tests
- [ ] PostgreSQL is running
- [ ] Database exists (`mary_joy_ethiopia`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured

### After Adding Tests
- [ ] All tests pass
- [ ] Coverage maintained/improved
- [ ] Documentation updated
- [ ] Test IDs assigned
- [ ] Cleanup implemented

### Before Deployment
- [ ] All tests pass
- [ ] Coverage > 80%
- [ ] No skipped tests
- [ ] CI/CD pipeline configured
- [ ] Documentation complete

---

## 🚦 Status

| Component | Status | Notes |
|-----------|--------|-------|
| Test Files | ✅ Complete | 8 files, 168 tests |
| Documentation | ✅ Complete | 4 documentation files |
| Configuration | ✅ Complete | Jest & setup configured |
| CI/CD | ⏳ Pending | GitHub Actions example provided |
| Coverage | ✅ Ready | Thresholds configured |

---

## 📞 Support

For questions or issues:
1. Check documentation files
2. Review test output
3. Verify configuration
4. Check database connection

---

**Last Updated**: 2025-10-04  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Total Tests**: 168
