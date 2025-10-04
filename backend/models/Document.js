const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type of document (e.g., consent_document, birth_certificate, id_card, etc.)'
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL/path to the uploaded document'
  },
  sponsor_cluster_id: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  guardian_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  beneficiary_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Document;
