const express = require('express');
const router = express.Router();
const { Notification, sequelize, Sequelize } = require('../models');

// GET notifications for a specific sponsor
router.get('/sponsors/:cluster_id/:specific_id', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Get notifications for this specific sponsor
    const sponsorNotifications = await Notification.findAndCountAll({
      where: {
        cluster_id: cluster_id,
        sponsor_specific_id: specific_id
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get global notifications (for all sponsors)
    const globalNotifications = await Notification.findAll({
      where: {
        cluster_id: null,
        sponsor_specific_id: null
      },
      order: [['created_at', 'DESC']],
      limit: 10 // Get last 10 global notifications
    });

    // Combine and sort by created_at
    const allNotifications = [
      ...sponsorNotifications.rows,
      ...globalNotifications
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Get unread count
    const unreadCount = await Notification.count({
      where: {
        cluster_id: cluster_id,
        sponsor_specific_id: specific_id,
        is_read: false
      }
    });

    res.json({
      notifications: allNotifications,
      pagination: {
        total: sponsorNotifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(sponsorNotifications.count / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET all notifications (for admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, type, is_read } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (type) whereClause.notification_type = type;
    if (is_read !== undefined) whereClause.is_read = is_read === 'true';

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      notifications: notifications.rows,
      pagination: {
        total: notifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(notifications.count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST create a new notification
router.post('/', async (req, res) => {
  try {
    const { cluster_id, sponsor_specific_id, message, notification_type, priority = 'normal' } = req.body;

    const notification = await Notification.create({
      cluster_id,
      sponsor_specific_id,
      message,
      notification_type,
      priority,
      is_read: false
    });

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({
      is_read: true,
      read_at: new Date()
    });

    res.json({
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT mark all notifications as read for a sponsor
router.put('/sponsors/:cluster_id/:specific_id/read-all', async (req, res) => {
  try {
    const { cluster_id, specific_id } = req.params;

    const [updatedCount] = await Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          cluster_id: cluster_id,
          sponsor_specific_id: specific_id,
          is_read: false
        }
      }
    );

    res.json({
      message: `${updatedCount} notifications marked as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE a notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST trigger payment due notifications check (for testing/admin)
router.post('/check-payment-due', async (req, res) => {
  try {
    const { checkPaymentDueNotifications } = require('../scripts/checkPaymentDueNotifications');
    await checkPaymentDueNotifications();
    res.json({ message: 'Payment due notifications check completed successfully' });
  } catch (error) {
    console.error('Error running payment due notifications check:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
