const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { UserCredentials, Employee, sequelize } = require('./models');

async function createDatabaseIfNotExists() {
  // Connect to postgres database to create our database
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'maryjoy_db';
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`🔄 Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database ${dbName} created successfully`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }

  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function setupAuthentication() {
  try {
    console.log('🔄 Setting up authentication system...');

    // Sync all models to create tables
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synced');

    // Create admin employee
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

    console.log('\n🎉 Authentication system setup completed!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Admin: admin@maryjoy.org / admin123');
    console.log('Database Officer: db.officer@maryjoy.org / dbofficer123');
    console.log('Coordinator: coordinator@maryjoy.org / coordinator123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database and authentication setup...');
    
    await createDatabaseIfNotExists();
    await setupAuthentication();
    
    console.log('\n✅ Setup completed successfully!');
    console.log('You can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
