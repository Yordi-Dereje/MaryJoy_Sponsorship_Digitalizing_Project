const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sponsorship = sequelize.define('Sponsorship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sponsor_cluster_id: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  beneficiary_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  monthly_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'terminated', 'pending'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'sponsorships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Sponsorship;
