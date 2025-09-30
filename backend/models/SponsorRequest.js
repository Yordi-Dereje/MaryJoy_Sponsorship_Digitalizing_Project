const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SponsorRequest = sequelize.define('SponsorRequest', {
  id: {
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
  number_of_child_beneficiaries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  number_of_elderly_beneficiaries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_beneficiaries: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processing'),
    defaultValue: 'pending',
    allowNull: false
  },
  request_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sponsor_requests',
  timestamps: false
});

module.exports = SponsorRequest;




