const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  department: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  access_level: {
    type: DataTypes.ENUM('admin', 'moderator', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Employee;
