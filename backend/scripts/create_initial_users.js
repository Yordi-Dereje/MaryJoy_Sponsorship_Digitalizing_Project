const bcrypt = require('bcrypt');
const { UserCredentials, Employee, Sponsor, sequelize } = require('../models');

async function createInitialUsers() {
  try {
    console.log('🔄 Creating initial users...');

    // Create a default admin employee if it doesn't exist
    const adminEmployee = await Employee.findOrCreate({
      where: { email: 'admin@maryjoy.org' },
      defaults: {
        full_name: 'System Administrator',
        phone_number: '+251911000000',
        email: 'admin@maryjoy.org',
        password_hash: await bcrypt.hash('admin123', 12),
        role: 'admin',
        department: 'IT',
        position: 'System Administrator'
      }
    });

    console.log('✅ Admin employee created/found:', adminEmployee[0].full_name);

    // Create admin credentials
    const adminCredentials = await UserCredentials.findOrCreate({
      where: { email: 'admin@maryjoy.org' },
      defaults: {
        email: 'admin@maryjoy.org',
        password_hash: await bcrypt.hash('admin123', 12),
        role: 'admin',
        employee_id: adminEmployee[0].id,
        is_active: true
      }
    });

    console.log('✅ Admin credentials created/found');

    // Create a database officer employee
    const dbOfficerEmployee = await Employee.findOrCreate({
      where: { email: 'db.officer@maryjoy.org' },
      defaults: {
        full_name: 'Database Officer',
        phone_number: '+251911000001',
        email: 'db.officer@maryjoy.org',
        password_hash: await bcrypt.hash('dbofficer123', 12),
        role: 'database_officer',
        department: 'Data Management',
        position: 'Database Officer'
      }
    });

    console.log('✅ Database Officer employee created/found:', dbOfficerEmployee[0].full_name);

    // Create database officer credentials
    const dbOfficerCredentials = await UserCredentials.findOrCreate({
      where: { email: 'db.officer@maryjoy.org' },
      defaults: {
        email: 'db.officer@maryjoy.org',
        password_hash: await bcrypt.hash('dbofficer123', 12),
        role: 'database_officer',
        employee_id: dbOfficerEmployee[0].id,
        is_active: true
      }
    });

    console.log('✅ Database Officer credentials created/found');

    // Create a coordinator employee
    const coordinatorEmployee = await Employee.findOrCreate({
      where: { email: 'coordinator@maryjoy.org' },
      defaults: {
        full_name: 'Program Coordinator',
        phone_number: '+251911000002',
        email: 'coordinator@maryjoy.org',
        password_hash: await bcrypt.hash('coordinator123', 12),
        role: 'coordinator',
        department: 'Program Management',
        position: 'Program Coordinator'
      }
    });

    console.log('✅ Coordinator employee created/found:', coordinatorEmployee[0].full_name);

    // Create coordinator credentials
    const coordinatorCredentials = await UserCredentials.findOrCreate({
      where: { email: 'coordinator@maryjoy.org' },
      defaults: {
        email: 'coordinator@maryjoy.org',
        password_hash: await bcrypt.hash('coordinator123', 12),
        role: 'coordinator',
        employee_id: coordinatorEmployee[0].id,
        is_active: true
      }
    });

    console.log('✅ Coordinator credentials created/found');

    // Create a test sponsor if one exists
    const testSponsor = await Sponsor.findOne({
      where: { cluster_id: '02', specific_id: '1001' }
    });

    if (testSponsor) {
      const sponsorCredentials = await UserCredentials.findOrCreate({
        where: { 
          sponsor_cluster_id: '02', 
          sponsor_specific_id: '1001' 
        },
        defaults: {
          email: 'sponsor@example.com',
          password_hash: await bcrypt.hash('sponsor123', 12),
          role: 'sponsor',
          sponsor_cluster_id: '02',
          sponsor_specific_id: '1001',
          is_active: true
        }
      });

      console.log('✅ Test sponsor credentials created/found');
    }

    console.log('🎉 Initial users created successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Admin: admin@maryjoy.org / admin123');
    console.log('Database Officer: db.officer@maryjoy.org / dbofficer123');
    console.log('Coordinator: coordinator@maryjoy.org / coordinator123');
    if (testSponsor) {
      console.log('Test Sponsor: sponsor@example.com / sponsor123');
    }

  } catch (error) {
    console.error('❌ Error creating initial users:', error);
    throw error;
  }
}

// Run script if called directly
if (require.main === module) {
  createInitialUsers()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = createInitialUsers;
