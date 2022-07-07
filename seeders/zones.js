"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("zones", [
      {
        code: "01",
        name: "เขตปศุสัตว์ที่ 1",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "02",
        name: "เขตปศุสัตว์ที่ 2",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "03",
        name: "เขตปศุสัตว์ที่ 3",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "04",
        name: "เขตปศุสัตว์ที่ 4",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "05",
        name: "เขตปศุสัตว์ที่ 5",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "06",
        name: "เขตปศุสัตว์ที่ 6",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "07",
        name: "เขตปศุสัตว์ที่ 7",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "08",
        name: "เขตปศุสัตว์ที่ 8",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "09",
        name: "เขตปศุสัตว์ที่ 9",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "10",
        name: "เขตปศุสัตว์ที่ 10",
        created_user_id: 1,
        created_datetime: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('organization_types', null, {});
  },
};
