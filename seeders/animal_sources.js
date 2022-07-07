"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("animal_sources", [
      {
        code: "BY",
        name: "ซื้อมา",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "IN",
        name: "เกิดในฟาร์ม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "MV",
        name: "ย้ายมา",
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
