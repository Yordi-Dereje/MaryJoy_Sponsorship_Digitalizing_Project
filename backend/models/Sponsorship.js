const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sponsorship = sequelize.define('Sponsorship', {
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
  status: {
    type: DataTypes.ENUM('active', 'completed', 'terminated', 'pending'),
    allowNull: false,
    defaultValue: 'active'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'sponsorships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Sponsorship;
