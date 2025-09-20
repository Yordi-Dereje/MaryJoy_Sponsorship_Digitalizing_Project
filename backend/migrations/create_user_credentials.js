const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'maryjoy_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function createUserCredentialsTable() {
  try {
    console.log('🔄 Creating user_credentials table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_credentials (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone_number VARCHAR(20) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'database_officer', 'coordinator', 'sponsor')),
        employee_id INTEGER REFERENCES employees(id),
        sponsor_cluster_id VARCHAR(10),
        sponsor_specific_id VARCHAR(10),
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login TIMESTAMP,
        login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ user_credentials table created successfully');

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials(email);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_credentials_phone ON user_credentials(phone_number);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_credentials_role ON user_credentials(role);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_credentials_employee_id ON user_credentials(employee_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_credentials_sponsor ON user_credentials(sponsor_cluster_id, sponsor_specific_id);
    `);

    console.log('✅ Indexes created successfully');

    // Add constraint to ensure either email or phone is provided
    await sequelize.query(`
      ALTER TABLE user_credentials 
      ADD CONSTRAINT check_email_or_phone 
      CHECK (email IS NOT NULL OR phone_number IS NOT NULL);
    `);

    console.log('✅ Constraints added successfully');

    // Update employees table to change access_level to role
    await sequelize.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) CHECK (role IN ('admin', 'database_officer', 'coordinator'));
    `);

    await sequelize.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS department VARCHAR(100);
    `);

    await sequelize.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS position VARCHAR(100);
    `);

    console.log('✅ Employee table updated successfully');

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  createUserCredentialsTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createUserCredentialsTable;
