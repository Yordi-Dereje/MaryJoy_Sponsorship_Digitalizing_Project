const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Guardian = sequelize.define('Guardian', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  relation_to_beneficiary: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'guardians',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Guardian;
