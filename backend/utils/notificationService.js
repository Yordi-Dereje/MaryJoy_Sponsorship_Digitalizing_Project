const { Notification } = require('../models');

/**
 * Notification Service - Creates notifications for various events
 */
class NotificationService {
  /**
   * Create a notification for a specific sponsor
   * @param {string} clusterId - Sponsor cluster ID
   * @param {string} specificId - Sponsor specific ID
   * @param {string} message - Notification message
   * @param {string} type - Notification type (payment_confirmed, report_uploaded, sponsorship_updated)
   * @param {string} priority - Priority level (low, normal, high, urgent)
   */
  static async createSponsorNotification(clusterId, specificId, message, type, priority = 'normal') {
    try {
      const notification = await Notification.create({
        cluster_id: clusterId,
        sponsor_specific_id: specificId,
        message,
        notification_type: type,
        priority,
        is_read: false
      });

      console.log(`✅ Notification created for sponsor ${clusterId}-${specificId}: ${message}`);
      return notification;
    } catch (error) {
      console.error('Error creating sponsor notification:', error);
      throw error;
    }
  }

  /**
   * Create a global notification for all sponsors
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {string} priority - Priority level
   */
  static async createGlobalNotification(message, type, priority = 'normal') {
    try {
      const notification = await Notification.create({
        cluster_id: null,
        sponsor_specific_id: null,
        message,
        notification_type: type,
        priority,
        is_read: false
      });

      console.log(`✅ Global notification created: ${message}`);
      return notification;
    } catch (error) {
      console.error('Error creating global notification:', error);
      throw error;
    }
  }

  /**
   * Create notification when a payment is confirmed
   * @param {Object} payment - Payment object
   */
  static async notifyPaymentConfirmed(payment) {
    const message = `Your payment of ${payment.amount} birr for ${this.formatPaymentPeriod(payment)} has been confirmed.`;
    return this.createSponsorNotification(
      payment.sponsor_cluster_id,
      payment.sponsor_specific_id,
      message,
      'payment_confirmed',
      'high'
    );
  }

  /**
   * Create notification when a report is uploaded
   * @param {Object} report - Report object
   */
  static async notifyReportUploaded(report) {
    const message = `A new report "${report.title || 'Impact Report'}" has been uploaded and is now available for download.`;
    return this.createGlobalNotification(
      message,
      'report_uploaded',
      'normal'
    );
  }

  /**
   * Create notification when sponsorship is updated
   * @param {string} clusterId - Sponsor cluster ID
   * @param {string} specificId - Sponsor specific ID
   * @param {Object} sponsorshipData - Updated sponsorship data
   */
  static async notifySponsorshipUpdated(clusterId, specificId, sponsorshipData) {
    const message = `Your sponsorship has been updated. You are now supporting ${sponsorshipData.beneficiaryCount || 0} beneficiaries.`;
    return this.createSponsorNotification(
      clusterId,
      specificId,
      message,
      'sponsorship_updated',
      'normal'
    );
  }

  /**
   * Create notification for payment due
   * @param {string} clusterId - Sponsor cluster ID
   * @param {string} specificId - Sponsor specific ID
   * @param {Object} paymentDueInfo - Payment due information
   */
  static async notifyPaymentDue(clusterId, specificId, paymentDueInfo) {
    const { month, year, daysOverdue, agreedAmount } = paymentDueInfo;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = months[month - 1];
    let message;
    let priority = 'normal';
    
    if (daysOverdue > 0) {
      // Overdue payment
      priority = daysOverdue > 30 ? 'urgent' : 'high';
      message = `Payment overdue: Your monthly payment of $${agreedAmount} for ${monthName} ${year} is ${daysOverdue} days overdue. Please submit your payment as soon as possible.`;
    } else {
      // Upcoming payment due
      const daysUntilDue = Math.abs(daysOverdue);
      if (daysUntilDue <= 7) {
        priority = 'high';
        message = `Payment due soon: Your monthly payment of $${agreedAmount} for ${monthName} ${year} is due in ${daysUntilDue} days.`;
      } else {
        message = `Payment reminder: Your monthly payment of $${agreedAmount} for ${monthName} ${year} is due in ${daysUntilDue} days.`;
      }
    }

    return await this.createSponsorNotification(
      clusterId,
      specificId,
      message,
      'payment_due',
      priority
    );
  }

  /**
   * Create notification for payment reminder
   * @param {string} clusterId - Sponsor cluster ID
   * @param {string} specificId - Sponsor specific ID
   * @param {Object} reminderInfo - Reminder information
   */
  static async notifyPaymentReminder(clusterId, specificId, reminderInfo) {
    const { month, year, agreedAmount, daysTillDue } = reminderInfo;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = months[month - 1];
    const message = `Payment Reminder: Your monthly contribution of $${agreedAmount} for ${monthName} ${year} will be due in ${daysTillDue} days. Thank you for your continued support!`;

    return await this.createSponsorNotification(
      clusterId,
      specificId,
      message,
      'payment_reminder',
      'normal'
    );
  }

  /**
   * Helper function to format payment period
   * @param {Object} payment - Payment object
   */
  static formatPaymentPeriod(payment) {
    if (!payment.start_month || !payment.start_year) return 'Unknown Period';

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const startMonth = months[payment.start_month - 1];
    const endMonth = payment.end_month ? months[payment.end_month - 1] : startMonth;
    const startYear = payment.start_year;
    const endYear = payment.end_year || startYear;

    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${startYear}`;
    }

    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }

  /**
   * Get unread notification count for a sponsor
   * @param {string} clusterId - Sponsor cluster ID
   * @param {string} specificId - Sponsor specific ID
   */
  static async getUnreadCount(clusterId, specificId) {
    try {
      // Sponsor-specific unread notifications
      const sponsorUnread = await Notification.count({
        where: {
          cluster_id: clusterId,
          sponsor_specific_id: specificId,
          is_read: false
        }
      });

      // Global unread notifications
      const globalUnread = await Notification.count({
        where: {
          cluster_id: null,
          sponsor_specific_id: null,
          is_read: false
        }
      });

      return sponsorUnread + globalUnread;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;
