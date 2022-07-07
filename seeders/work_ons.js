"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("work_ons", [
      {
        code: "01",
        name: "ส่งเสริม",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "02",
        name: "สุขภาพ",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "03",
        name: "ผสมเทียม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "04",
        name: "ปรับปรุงพันธุ์",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "05",
        name: "คุณภาพน้ำนม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "06",
        name: "โภชนาการ",
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
