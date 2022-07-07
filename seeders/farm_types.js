"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("farm_types", [
      {
        code: "01",
        name: "ฟาร์มทั่วไป",
        created_user_id: 1,
        created_datetime: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('titlenames', null, {});
     */
  },
};
