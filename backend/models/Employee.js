// models/employee.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Employee extends Model {
    static associate(models) {
      // Association with UserCredentials
      Employee.hasOne(models.UserCredentials, {
        foreignKey: 'employee_id',
        as: 'credentials'
      });
      Employee.hasMany(models.Payment, { 
        foreignKey: 'confirmed_by', 
        as: 'confirmedPayments' 
      });

      Employee.hasMany(models.Sponsor, { 
        foreignKey: 'created_by', 
        as: 'createdSponsors' 
      });
      
      // Self-reference for created_by
      Employee.belongsTo(models.Employee, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    }
  }

  Employee.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
   access_level: {
      type: DataTypes.ENUM('admin', 'database_officer', 'coordinator'),
      allowNull: false
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
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }); 

  return Employee;
};
