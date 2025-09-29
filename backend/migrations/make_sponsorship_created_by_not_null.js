const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make created_by column NOT NULL
    await queryInterface.changeColumn('sponsorships', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    });

    // For existing records without created_by, set it to the first admin employee
    const [employees] = await queryInterface.sequelize.query(
      'SELECT id FROM employees WHERE access_level = \'admin\' LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (employees && employees.length > 0) {
      await queryInterface.sequelize.query(
        `UPDATE sponsorships SET created_by = $1 WHERE created_by IS NULL`,
        { bind: [employees[0].id] }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Make created_by nullable again
    await queryInterface.changeColumn('sponsorships', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      }
    });
  }
};
