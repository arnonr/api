"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("groups", [
      {
        code: "01",
        name: "Administrator",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "02",
        name: "ผู้บริหาร",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "03",
        name: "เจ้าหน้าที่ทะเบียนหน่วยงาน",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "04",
        name: "เจ้าหน้าที่ผสมเทียม",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "05",
        name: "cowCenter",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "06",
        name: "Farmer",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "07",
        name: "DHHU",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "08",
        name: "นักวิชาการปรับปรุงพันธ์",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "09",
        name: "FMMU",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "10",
        name: "เจ้าหน้าที่ทะเบียนฟาร์ม",
        data_access_level_id: 1,
        description: "",
        created_user_id: 1,
        created_datetime: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('organization_types', null, {});
  },
};
