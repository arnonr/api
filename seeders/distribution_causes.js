"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("distribution_causes", [
      {
        code: "001",
        name: "ปัญหาระบบสืบพันธุ์",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "002",
        name: "ปัญหาเต้านม",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "003",
        name: "ปัญหาจากขาและกีบ",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "004",
        name: "น้ำนมน้อย",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "005",
        name: "ป่่วย",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "006",
        name: "การจัดการ",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "007",
        name: "นิสัยไม่ดี",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "008",
        name: "อายุมาก",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "009",
        name: "ขายพันธุ์",
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
