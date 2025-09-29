const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove sponsor_cluster_id and sponsor_specific_id columns from phone_numbers table
    await queryInterface.removeColumn('phone_numbers', 'sponsor_cluster_id');
    await queryInterface.removeColumn('phone_numbers', 'sponsor_specific_id');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the columns if needed to rollback
    await queryInterface.addColumn('phone_numbers', 'sponsor_cluster_id', {
      type: Sequelize.STRING(2),
      allowNull: true
    });
    await queryInterface.addColumn('phone_numbers', 'sponsor_specific_id', {
      type: Sequelize.STRING(4),
      allowNull: true
    });
  }
};
