"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("personal_types", [
      {
        code: "01",
        name: "ข้าราชการ",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "02",
        name: "พนักงานราชการ",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "03",
        name: "เจ้าหน้าที่",
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
