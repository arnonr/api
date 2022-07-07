"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("distribution_statuses", [
      {
        code: "DE",
        name: "ตาย",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "SL",
        name: "ขาย",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "WA",
        name: "คัดทิ้ง",
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
