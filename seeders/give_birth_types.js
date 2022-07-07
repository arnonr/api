"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("give_birth_types", [
      {
        code: "00",
        name: "คลอดปกติ",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "01",
        name: "ช่วยเล็กน้อย",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "02",
        name: "ช่วยมาก",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "03",
        name: "แก้ไขท่า / ดึงออก",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "04",
        name: "คลอดปกติ",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "05",
        name: "ผ่าออก",
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
