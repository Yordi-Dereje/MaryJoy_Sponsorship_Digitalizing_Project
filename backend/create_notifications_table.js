const { Sequelize } = require('sequelize');

async function createNotificationsTable() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mary_joy_sponsorship',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    logging: false
  });

  try {
    console.log('Creating notifications table...');

    // Create notifications table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        cluster_id VARCHAR(10) NOT NULL,
        sponsor_specific_id VARCHAR(10),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        notification_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL
      );
    `);

    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_cluster_sponsor
      ON notifications(cluster_id, sponsor_specific_id);
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_type
      ON notifications(notification_type);
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_read
      ON notifications(is_read);
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at
      ON notifications(created_at DESC);
    `);

    console.log('✅ Notifications table created successfully!');
    console.log('✅ Indexes created successfully!');

  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  createNotificationsTable();
}

module.exports = { createNotificationsTable };
