const { sequelize } = require('./models');

async function createReportsTable() {
  try {
    console.log('Creating reports table...');
    
    // Create the reports table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        file VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by INTEGER NOT NULL REFERENCES "Employees"(id)
      );
    `);
    
    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
    `);
    
    console.log('✅ Reports table created successfully!');
    console.log('✅ Indexes created successfully!');
    
    // Verify the table structure
    const tableInfo = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'reports' 
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n📋 Reports table structure:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Error creating reports table:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
createReportsTable();
