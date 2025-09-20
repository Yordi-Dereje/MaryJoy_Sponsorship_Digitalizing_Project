const bcrypt = require('bcrypt');
const { UserCredentials, Employee, Sponsor, sequelize } = require('./models');

async function setupAuth() {
  try {
    console.log('🚀 Setting up Mary Joy Authentication System...');
    console.log('================================================');

    // Test database connection
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync all models to ensure tables exist
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');

    // Create default admin employee
    console.log('🔄 Creating default admin employee...');
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

    console.log('✅ Admin employee:', adminEmployee[0].full_name);

    // Create admin credentials
    console.log('🔄 Creating admin credentials...');
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

    console.log('✅ Admin credentials created');

    // Create database officer employee
    console.log('🔄 Creating database officer employee...');
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

    console.log('✅ Database Officer employee:', dbOfficerEmployee[0].full_name);

    // Create database officer credentials
    console.log('🔄 Creating database officer credentials...');
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

    console.log('✅ Database Officer credentials created');

    // Create coordinator employee
    console.log('🔄 Creating coordinator employee...');
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

    console.log('✅ Coordinator employee:', coordinatorEmployee[0].full_name);

    // Create coordinator credentials
    console.log('🔄 Creating coordinator credentials...');
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

    console.log('✅ Coordinator credentials created');

    // Try to create sponsor credentials if a sponsor exists
    console.log('🔄 Checking for existing sponsors...');
    const existingSponsor = await Sponsor.findOne({
      where: { cluster_id: '02', specific_id: '1001' }
    });

    if (existingSponsor) {
      console.log('🔄 Creating sponsor credentials...');
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

      console.log('✅ Sponsor credentials created');
    } else {
      console.log('ℹ️  No existing sponsor found for test credentials');
    }

    console.log('\n🎉 Authentication system setup completed successfully!');
    console.log('================================================');
    console.log('\n📋 Default Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ Admin: admin@maryjoy.org / admin123                    │');
    console.log('│ Database Officer: db.officer@maryjoy.org / dbofficer123│');
    console.log('│ Coordinator: coordinator@maryjoy.org / coordinator123 │');
    if (existingSponsor) {
      console.log('│ Test Sponsor: sponsor@example.com / sponsor123         │');
    }
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n🚀 You can now start the server and test the login system!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupAuth()
    .then(() => {
      console.log('Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupAuth;
