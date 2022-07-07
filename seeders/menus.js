"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("menus", [
      {
        code: "user",
        name: "ระบบผู้ใช้งาน",
        sequence: 1,
        is_active: 1,
      },
      {
        code: "registration",
        name: "ระบบทะเบียน",
        sequence: 2,
        is_active: 1,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
