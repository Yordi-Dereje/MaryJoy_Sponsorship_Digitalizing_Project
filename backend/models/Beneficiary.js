const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Beneficiary = sequelize.define('Beneficiary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('child', 'elderly'),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'graduated', 'deceased'),
    allowNull: false,
    defaultValue: 'pending'
  },
  guardian_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'beneficiaries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Beneficiary;
