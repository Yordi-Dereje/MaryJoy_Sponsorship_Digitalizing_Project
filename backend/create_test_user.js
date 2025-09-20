const bcrypt = require('bcrypt');
const { UserCredentials, Employee, sequelize } = require('./models');

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');

    // Create a test employee
    const employee = await Employee.create({
      full_name: 'Test Database Officer',
      phone_number: '+251911000001',
      email: 'db.officer@maryjoy.org',
      password_hash: await bcrypt.hash('dbofficer123', 12),
      role: 'database_officer',
      department: 'Data Management',
      position: 'Database Officer'
    });

    console.log('✅ Employee created:', employee.full_name);

    // Create user credentials
    const credentials = await UserCredentials.create({
      email: 'db.officer@maryjoy.org',
      password_hash: await bcrypt.hash('dbofficer123', 12),
      role: 'database_officer',
      employee_id: employee.id,
      is_active: true
    });

    console.log('✅ Credentials created for:', credentials.email);

    // Test password verification
    const isValid = await bcrypt.compare('dbofficer123', credentials.password_hash);
    console.log('🔐 Password verification test:', isValid);

    console.log('\n📋 Test user created successfully!');
    console.log('Email: db.officer@maryjoy.org');
    console.log('Password: dbofficer123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await sequelize.close();
  }
}

createTestUser();
