const { Notification } = require('../models');
const NotificationService = require('../utils/notificationService');

/**
 * Script to create test payment due notifications for development/testing
 */

async function createTestNotifications() {
  console.log('🔄 Creating test payment due notifications...');
  
  try {
    // Create a payment due notification (overdue)
    await NotificationService.notifyPaymentDue('02', '1001', {
      month: 7,
      year: 2025,
      daysOverdue: 79,
      agreedAmount: 500
    });
    
    // Create a payment reminder notification
    await NotificationService.notifyPaymentReminder('02', '1001', {
      month: 11,
      year: 2025,
      agreedAmount: 500,
      daysTillDue: 3
    });
    
    // Create a payment confirmed notification
    await NotificationService.notifyPaymentConfirmed({
      sponsor_cluster_id: '02',
      sponsor_specific_id: '1001',
      amount: 500,
      start_month: 10,
      start_year: 2025,
      end_month: 10,
      end_year: 2025
    });
    
    console.log('✅ Test notifications created successfully');
    
    // List all notifications for this sponsor
    const notifications = await Notification.findAll({
      where: {
        cluster_id: '02',
        sponsor_specific_id: '1001'
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📋 Found ${notifications.length} notifications for sponsor 02-1001:`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.notification_type}] ${notif.message} (${notif.priority})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
    throw error;
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  createTestNotifications()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestNotifications };
