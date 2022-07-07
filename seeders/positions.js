"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("positions", [
      {
        code: "01",
        name: "สัตว์แพทย์",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "02",
        name: "นักวิชาการ",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "03",
        name: "เกษตรกร",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "04",
        name: "อาสาปศุสัตว์",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "05",
        name: "เจ้าหน้าที่ผสมเทียม",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "06",
        name: "สัตวบาล",
        created_user_id: 1,
        created_datetime: new Date(),
      },
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
