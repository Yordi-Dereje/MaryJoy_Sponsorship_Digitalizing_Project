const { Notification } = require('../models');
const NotificationService = require('../utils/notificationService');

/**
 * Script to create a specific notification for John Smith showing his next payment is approaching
 */

async function createJohnNotification() {
  console.log('🔄 Creating notification for John Smith...');
  
  try {
    // John's details: 02-1000, last paid through December 2025, next due January 2026
    const johnClusterId = '02';
    const johnSpecificId = '1000';
    const johnAgreedAmount = 500;
    
    // Clear any existing notifications for John first
    await Notification.destroy({
      where: {
        cluster_id: johnClusterId,
        sponsor_specific_id: johnSpecificId
      }
    });
    console.log('🗑️ Cleared existing notifications for John Smith');
    
    // Calculate days until January 15, 2026 (payment due date)
    const now = new Date();
    const dueDate = new Date(2026, 0, 15); // January 15, 2026
    const daysDifference = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Current date: ${now.toDateString()}`);
    console.log(`📅 Due date: ${dueDate.toDateString()}`);
    console.log(`📅 Days until due: ${daysDifference}`);
    
    // Create payment reminder notification for January 2026
    await NotificationService.notifyPaymentReminder(johnClusterId, johnSpecificId, {
      month: 1, // January
      year: 2026,
      agreedAmount: johnAgreedAmount,
      daysTillDue: daysDifference
    });
    
    // Also create a payment confirmation for his October payment
    await NotificationService.notifyPaymentConfirmed({
      sponsor_cluster_id: johnClusterId,
      sponsor_specific_id: johnSpecificId,
      amount: 1000, // His last payment was 1000 birr for Oct-Dec
      start_month: 10,
      start_year: 2025,
      end_month: 12,
      end_year: 2025
    });
    
    console.log('✅ Notifications created for John Smith');
    
    // List all notifications for John
    const notifications = await Notification.findAll({
      where: {
        cluster_id: johnClusterId,
        sponsor_specific_id: johnSpecificId
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📋 John Smith now has ${notifications.length} notifications:`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.notification_type}] ${notif.message}`);
      console.log(`   Priority: ${notif.priority}, Read: ${notif.is_read}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating notification for John Smith:', error);
    throw error;
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  createJohnNotification()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createJohnNotification };
