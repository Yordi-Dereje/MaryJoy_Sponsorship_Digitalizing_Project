const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhoneNumber = sequelize.define('PhoneNumber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entity_type: {
    type: DataTypes.ENUM('sponsor', 'beneficiary', 'guardian'),
    allowNull: false
  },
  sponsor_cluster_id: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  beneficiary_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  guardian_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  primary_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  secondary_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tertiary_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'phone_numbers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PhoneNumber;
