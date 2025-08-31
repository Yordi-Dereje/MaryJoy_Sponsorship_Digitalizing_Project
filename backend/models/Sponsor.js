const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sponsor = sequelize.define('Sponsor', {
  cluster_id: {
    type: DataTypes.STRING(2),
    primaryKey: true,
    allowNull: false
  },
  specific_id: {
    type: DataTypes.STRING(4),
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
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  profile_picture_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  starting_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  agreed_monthly_payment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  emergency_contact_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending_review', 'suspended'),
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
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sponsor_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  consent_document_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'sponsors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Sponsor;
