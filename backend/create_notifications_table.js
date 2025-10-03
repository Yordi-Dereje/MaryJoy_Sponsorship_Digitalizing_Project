const { sequelize } = require('./models');

async function createNotificationsTable() {
  try {
    console.log('🔄 Creating notifications table...');
    
    // Create the notifications table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        cluster_id VARCHAR(10) NOT NULL,
        sponsor_specific_id VARCHAR(10),
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        notification_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'normal',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        read_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_sponsor 
      ON notifications(cluster_id, sponsor_specific_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_unread 
      ON notifications(is_read) WHERE is_read = false;
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
      ON notifications(created_at DESC);
    `);
    
    console.log('✅ Notifications table created successfully with indexes');
    
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// If this script is run directly
if (require.main === module) {
  createNotificationsTable()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createNotificationsTable };