const { sequelize } = require('./models');

async function fixReportsTable() {
  try {
    console.log('Checking reports table structure...');
    
    // Check current data type
    const columnInfo = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'reports' AND column_name = 'file'
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Current file column info:', columnInfo);
    
    // If the column is BYTEA, we need to fix it
    if (columnInfo.length > 0 && columnInfo[0].data_type === 'bytea') {
      console.log('⚠️  File column is BYTEA, converting to VARCHAR...');
      
      // First, let's see what data we have
      const reports = await sequelize.query(`
        SELECT id, file_name, encode(file, 'escape') as file_path FROM reports;
      `, { type: sequelize.QueryTypes.SELECT });
      
      console.log('Current reports:', reports);
      
      // Drop and recreate the table with correct schema
      await sequelize.query(`DROP TABLE IF EXISTS reports CASCADE;`);
      
      await sequelize.query(`
        CREATE TABLE reports (
          id SERIAL PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          file VARCHAR(500) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by INTEGER NOT NULL REFERENCES "Employees"(id)
        );
      `);
      
      // Recreate indexes
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
      `);
      
      console.log('✅ Reports table recreated with correct schema!');
      
    } else if (columnInfo.length > 0 && columnInfo[0].data_type === 'character varying') {
      console.log('✅ File column is already VARCHAR, no changes needed.');
    } else {
      console.log('❓ Unexpected column type or column not found.');
    }
    
    // Verify the final structure
    const finalTableInfo = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'reports' 
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n📋 Final reports table structure:');
    console.table(finalTableInfo);
    
  } catch (error) {
    console.error('❌ Error fixing reports table:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixReportsTable();
