// models/Sponsor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sponsor = sequelize.define('Sponsor', {
  cluster_id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false
  },
  specific_id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('individual', 'organization'),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true
  },
  starting_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  monthly_amount: { // Changed from agreed_monthly_payment to match your SQL
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  emergency_contact_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending_review', 'under_review'),
    allowNull: false,
    defaultValue: 'pending_review'
  },
  is_diaspora: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  consent_document_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
  // REMOVE profile_picture_url, phone_number, and sponsor_id as they don't exist in your DB
}, {
  tableName: 'sponsors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Sponsor;
