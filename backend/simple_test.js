console.log('Starting simple test...');

try {
  const { sequelize } = require('./models');
  
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection successful');
      
      // Test a simple query
      return sequelize.query('SELECT COUNT(*) FROM user_credentials');
    })
    .then(([results]) => {
      console.log('✅ Query successful, user_credentials count:', results[0].count);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Failed to load models:', error.message);
  process.exit(1);
}
