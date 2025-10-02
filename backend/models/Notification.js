const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cluster_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(10),
    allowNull: true // Allow null for global notifications
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notification_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'normal'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: false
});

module.exports = Notification;
