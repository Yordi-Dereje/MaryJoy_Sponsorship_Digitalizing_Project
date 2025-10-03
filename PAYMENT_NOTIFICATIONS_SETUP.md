# Payment Notification System

This document explains how the payment notification system works for sponsors in the Mary Joy Sponsorship Platform.

## Overview

The payment notification system automatically generates notifications for sponsors when:
- Payments are overdue (1, 7, 15, 30 days after due date)
- Payment reminders (7 and 3 days before due date)
- Payment confirmations (when payments are confirmed by admin)

## Setup

### 1. Database Setup

The notifications table is created using the migration script:

```bash
cd backend
node create_notifications_table.js
```

### 2. Running Payment Due Checks

You can run the payment notification check manually:

```bash
cd backend
node scripts/checkPaymentDueNotifications.js
```

Or via API endpoint:

```bash
curl -X POST http://localhost:5000/api/notifications/check-payment-due
```

### 3. Automated Scheduling (Recommended)

For production, set up a daily cron job to run the payment notification check:

```bash
# Add this to your crontab (crontab -e)
# Run every day at 9:00 AM
0 9 * * * cd /path/to/your/project/backend && node scripts/checkPaymentDueNotifications.js
```

## How It Works

### Payment Due Logic

- **Due Date**: Payments are due on the 15th of each month
- **Calculation**: Based on the last confirmed payment, the system calculates when the next payment is due
- **Overdue Notifications**: Sent on days 1, 7, 15, and 30 after the due date
- **Reminder Notifications**: Sent 7 and 3 days before the due date

### Notification Types

1. **payment_due** - Overdue payment notifications
   - Priority: `urgent` (>30 days), `high` (1-30 days)
   - Example: "Payment overdue: Your monthly payment of $500 for July 2025 is 79 days overdue. Please submit your payment as soon as possible."

2. **payment_reminder** - Upcoming payment reminders
   - Priority: `high` (≤7 days), `normal` (>7 days)
   - Example: "Payment Reminder: Your monthly contribution of $500 for November 2025 will be due in 3 days. Thank you for your continued support!"

3. **payment_confirmed** - Payment confirmation
   - Priority: `high`
   - Example: "Your payment of 500 birr for October 2025 has been confirmed."

### Frontend Integration

The sponsor dashboard automatically fetches and displays notifications with:
- Real-time unread count badge
- Color-coded priority indicators (red=urgent, orange=high, blue=normal)
- Click to mark as read functionality
- Mark all as read option

## API Endpoints

### Get Sponsor Notifications
```
GET /api/notifications/sponsors/:cluster_id/:specific_id?page=1&limit=20
```

### Mark Notification as Read
```
PUT /api/notifications/:id/read
```

### Mark All Notifications as Read for Sponsor
```
PUT /api/notifications/sponsors/:cluster_id/:specific_id/read-all
```

### Trigger Payment Due Check (Admin)
```
POST /api/notifications/check-payment-due
```

## Testing

### Create Test Notifications
```bash
cd backend
node scripts/createTestNotifications.js
```

### Test API Endpoints
```bash
# Get notifications for sponsor 02-1001
curl "http://localhost:5000/api/notifications/sponsors/02/1001?page=1&limit=20"

# Mark notification as read
curl -X PUT http://localhost:5000/api/notifications/1/read

# Mark all as read for sponsor
curl -X PUT http://localhost:5000/api/notifications/sponsors/02/1001/read-all
```

## Configuration

You can modify the notification settings in `backend/scripts/checkPaymentDueNotifications.js`:

```javascript
const PAYMENT_DUE_DAY = 15; // Payments are due on the 15th of each month
const REMINDER_DAYS_BEFORE = [7, 3]; // Send reminders 7 and 3 days before due date
const OVERDUE_NOTIFICATION_DAYS = [1, 7, 15, 30]; // Send overdue notifications after these days
```

## Troubleshooting

### Common Issues

1. **Notifications table doesn't exist**
   - Run: `node create_notifications_table.js`

2. **No notifications appearing**
   - Check if sponsors have payments in the database
   - Verify payment due dates are calculated correctly
   - Run the notification check manually

3. **Frontend not showing notifications**
   - Check browser console for API errors
   - Verify the sponsor is logged in with correct cluster_id and specific_id
   - Test API endpoints directly with curl

### Logs

The notification system provides detailed console logs:
- `🔄` Starting operations
- `✅` Successful operations
- `❌` Error operations
- `👤` Sponsor-specific information
- `🔔` Notification sent
- `📅` Date information

## Security Considerations

- Notifications contain sensitive payment information
- Only sponsors can see their own notifications
- Admin endpoints should be protected with authentication
- Consider rate limiting for API endpoints

## Future Enhancements

Potential improvements for the notification system:
- Email/SMS notifications
- Webhook integrations
- Push notifications
- Customizable notification preferences
- Bulk notification management
- Advanced filtering and search
