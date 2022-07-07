"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("production_statuses", [
      {
        code: "AB",
        name: "แท้ง",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "CV",
        name: "คลอด",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        code: "DU",
        name: "สงสัยท้อง",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "MA",
        name: "ผสม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "NO",
        name: "ไม่ท้อง",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "PG",
        name: "ท้อง",
        created_user_id: 1,
        created_datetime: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('organization_types', null, {});
  },
};
