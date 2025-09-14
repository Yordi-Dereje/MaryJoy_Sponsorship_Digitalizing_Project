const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Ethiopia'
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sub_region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  woreda: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  house_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Address;
