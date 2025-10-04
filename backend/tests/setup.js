// Test setup file
const { sequelize } = require('../models');

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global setup
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Test database connection established');
  } catch (error) {
    console.error('❌ Unable to connect to test database:', error);
    throw error;
  }
});

// Global teardown
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Error closing test database connection:', error);
  }
});
