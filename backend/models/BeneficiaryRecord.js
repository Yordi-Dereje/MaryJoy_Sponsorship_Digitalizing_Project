const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BeneficiaryRecord = sequelize.define('BeneficiaryRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    beneficiary_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Beneficiaries',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('graduation', 'termination'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'The reason provided for graduation/termination'
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Path to uploaded supporting document'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      },
      comment: 'Employee ID who created this record'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'beneficiary_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  BeneficiaryRecord.associate = (models) => {
    // Belongs to Beneficiary
    BeneficiaryRecord.belongsTo(models.Beneficiary, {
      foreignKey: 'beneficiary_id',
      as: 'beneficiary'
    });

    // Belongs to Employee (who created the record)
    BeneficiaryRecord.belongsTo(models.Employee, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  };

  return BeneficiaryRecord;
};
