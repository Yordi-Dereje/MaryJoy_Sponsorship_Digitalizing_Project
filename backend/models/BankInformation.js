const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BankInformation = sequelize.define('BankInformation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entity_type: {
    type: DataTypes.ENUM('beneficiary', 'guardian', 'sponsor'),
    allowNull: false
  },
  beneficiary_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  guardian_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sponsor_cluster_id: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  bank_account_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  bank_book_photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'bank_information',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = BankInformation;
