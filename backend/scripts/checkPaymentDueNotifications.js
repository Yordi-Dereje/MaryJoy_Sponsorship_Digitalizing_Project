const { Sponsor, Payment, Notification, sequelize } = require('../models');
const NotificationService = require('../utils/notificationService');

/**
 * Script to check for payment due dates and generate notifications
 * This should be run daily via cron job or scheduler
 */

const PAYMENT_DUE_DAY = 15; // Payments are due on the 15th of each month
const REMINDER_DAYS_BEFORE = [7, 3]; // Send reminders 7 and 3 days before due date
const OVERDUE_NOTIFICATION_DAYS = [1, 7, 15, 30]; // Send overdue notifications after these days

async function checkPaymentDueNotifications() {
  console.log('🔄 Starting payment due notification check...');
  
  try {
    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = now.getDate();
    
    console.log(`📅 Current date: ${currentYear}-${currentMonth}-${currentDay}`);
    
    // Get all active sponsors with their payment information
    const sponsors = await Sponsor.findAll({
      where: { status: 'active' },
      attributes: ['cluster_id', 'specific_id', 'full_name', 'agreed_monthly_payment']
    });
    
    console.log(`👥 Found ${sponsors.length} active sponsors to check`);
    
    for (const sponsor of sponsors) {
      await checkSponsorPaymentStatus(sponsor, currentYear, currentMonth, currentDay);
    }
    
    console.log('✅ Payment due notification check completed');
    
  } catch (error) {
    console.error('❌ Error checking payment due notifications:', error);
    throw error;
  }
}

async function checkSponsorPaymentStatus(sponsor, currentYear, currentMonth, currentDay) {
  try {
    const { cluster_id, specific_id, full_name, agreed_monthly_payment } = sponsor;
    
    // Get the sponsor's most recent payment
    const recentPayment = await Payment.findOne({
      where: {
        sponsor_cluster_id: cluster_id,
        sponsor_specific_id: specific_id,
        status: 'confirmed'
      },
      order: [
        ['end_year', 'DESC'],
        ['end_month', 'DESC'],
        ['payment_date', 'DESC']
      ]
    });
    
    let lastPaidMonth, lastPaidYear;
    
    if (recentPayment) {
      lastPaidMonth = recentPayment.end_month || recentPayment.start_month;
      lastPaidYear = recentPayment.end_year || recentPayment.start_year;
    } else {
      // No payments found - they should pay for current month
      lastPaidMonth = currentMonth - 1;
      lastPaidYear = currentYear;
      
      if (lastPaidMonth <= 0) {
        lastPaidMonth = 12;
        lastPaidYear = currentYear - 1;
      }
    }
    
    // Calculate next payment due month/year
    let dueMonth = lastPaidMonth + 1;
    let dueYear = lastPaidYear;
    
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }
    
    // Calculate due date (15th of the due month)
    const dueDate = new Date(dueYear, dueMonth - 1, PAYMENT_DUE_DAY);
    const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
    
    // Calculate days difference
    const daysDifference = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
    
    console.log(`👤 ${full_name} (${cluster_id}-${specific_id}): Last paid ${lastPaidMonth}/${lastPaidYear}, Due ${dueMonth}/${dueYear}, Days diff: ${daysDifference}`);
    
    // Check if we need to send any notifications
    await checkAndSendNotifications(
      cluster_id,
      specific_id,
      full_name,
      agreed_monthly_payment,
      dueMonth,
      dueYear,
      daysDifference,
      currentDate,
      dueDate
    );
    
  } catch (error) {
    console.error(`❌ Error checking payment status for sponsor ${cluster_id}-${specific_id}:`, error);
  }
}

async function checkAndSendNotifications(clusterId, specificId, fullName, agreedAmount, dueMonth, dueYear, daysDifference, currentDate, dueDate) {
  try {
    // Check if payment is overdue
    if (daysDifference > 0) {
      // Payment is overdue
      if (OVERDUE_NOTIFICATION_DAYS.includes(daysDifference)) {
        // Check if we already sent this type of notification today
        const existingNotification = await Notification.findOne({
          where: {
            cluster_id: clusterId,
            sponsor_specific_id: specificId,
            notification_type: 'payment_due',
            created_at: {
              [sequelize.Sequelize.Op.gte]: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
            }
          }
        });
        
        if (!existingNotification) {
          console.log(`🔔 Sending overdue notification to ${fullName}: ${daysDifference} days overdue`);
          
          await NotificationService.notifyPaymentDue(clusterId, specificId, {
            month: dueMonth,
            year: dueYear,
            daysOverdue: daysDifference,
            agreedAmount: parseFloat(agreedAmount)
          });
        }
      }
    } else {
      // Payment is not yet due - check for reminders
      const daysUntilDue = Math.abs(daysDifference);
      
      if (REMINDER_DAYS_BEFORE.includes(daysUntilDue)) {
        // Check if we already sent this reminder today
        const existingReminder = await Notification.findOne({
          where: {
            cluster_id: clusterId,
            sponsor_specific_id: specificId,
            notification_type: 'payment_reminder',
            created_at: {
              [sequelize.Sequelize.Op.gte]: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
            }
          }
        });
        
        if (!existingReminder) {
          console.log(`🔔 Sending payment reminder to ${fullName}: ${daysUntilDue} days until due`);
          
          await NotificationService.notifyPaymentReminder(clusterId, specificId, {
            month: dueMonth,
            year: dueYear,
            agreedAmount: parseFloat(agreedAmount),
            daysTillDue: daysUntilDue
          });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error sending notifications for sponsor ${clusterId}-${specificId}:`, error);
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  checkPaymentDueNotifications()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkPaymentDueNotifications };
