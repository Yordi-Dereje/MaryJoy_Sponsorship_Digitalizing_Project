const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('beneficiary_records', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      beneficiary_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'beneficiaries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Employee ID who created this record'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('beneficiary_records', ['beneficiary_id']);
    await queryInterface.addIndex('beneficiary_records', ['type']);
    await queryInterface.addIndex('beneficiary_records', ['created_by']);
    await queryInterface.addIndex('beneficiary_records', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop indexes first
    await queryInterface.removeIndex('beneficiary_records', ['beneficiary_id']);
    await queryInterface.removeIndex('beneficiary_records', ['type']);
    await queryInterface.removeIndex('beneficiary_records', ['created_by']);
    await queryInterface.removeIndex('beneficiary_records', ['created_at']);
    
    // Drop the table
    await queryInterface.dropTable('beneficiary_records');
    
    // Drop the enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_beneficiary_records_type";');
  }
};
