const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  file: {
    type: DataTypes.STRING, // This will store the file path/URL
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'id'
    }
  }
}, {
  tableName: 'reports',
  timestamps: false, // We're using custom created_at field
  indexes: [
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Report;
