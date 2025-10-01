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
    allowNull: true
  },
  end_month: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bank_receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  company_receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  confirmed_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'pending'
  },
  start_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  end_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: false
});

module.exports = Payment;
