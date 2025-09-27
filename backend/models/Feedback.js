const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  feedback_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sponsor_cluster_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  sponsor_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'responded'),
    defaultValue: 'pending',
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responded_by: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'feedbacks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Feedback;




