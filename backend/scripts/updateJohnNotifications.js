const { Notification } = require('../models');
const NotificationService = require('../utils/notificationService');

/**
 * Script to create specific notifications for John Smith showing October paid and November approaching
 */

async function updateJohnNotifications() {
  console.log('🔄 Updating notifications for John Smith...');
  
  try {
    // Clear existing notifications for John
    await Notification.destroy({
      where: {
        cluster_id: '02',
        sponsor_specific_id: '1000'
      }
    });
    console.log('🗑️ Cleared existing notifications');
    
    // Create a payment confirmation for October
    await NotificationService.notifyPaymentConfirmed({
      sponsor_cluster_id: '02',
      sponsor_specific_id: '1000',
      amount: 500,
      start_month: 10,
      start_year: 2025,
      end_month: 10,
      end_year: 2025
    });
    
    // Create a custom notification showing November is approaching
    await Notification.create({
      cluster_id: '02',
      sponsor_specific_id: '1000',
      message: 'Thank you for your October 2025 payment! Your next payment for November 2025 is approaching and will be due on November 15th.',
      notification_type: 'payment_reminder',
      priority: 'normal',
      is_read: false
    });
    
    console.log('✅ Updated notifications for John Smith');
    
    // Show the notifications
    const notifications = await Notification.findAll({
      where: {
        cluster_id: '02',
        sponsor_specific_id: '1000'
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log('📋 John Smith notifications:');
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.notification_type}] ${notif.message}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating notifications:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  updateJohnNotifications()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateJohnNotifications };
