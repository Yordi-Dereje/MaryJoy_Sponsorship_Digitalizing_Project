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

async function removeMonthlyAmountFromSponsorships() {
  try {
    console.log('🔄 Removing monthly_amount column from sponsorships table...');

    // Drop the monthly_amount column from sponsorships table
    await sequelize.query(`
      ALTER TABLE sponsorships
      DROP COLUMN IF EXISTS monthly_amount;
    `);

    console.log('✅ monthly_amount column removed successfully');
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
  removeMonthlyAmountFromSponsorships()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = removeMonthlyAmountFromSponsorships;
