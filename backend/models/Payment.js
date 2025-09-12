const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sponsor_cluster_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  start_month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end_month: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bank_receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  company_receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  reference_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  confirmed_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Payment;
