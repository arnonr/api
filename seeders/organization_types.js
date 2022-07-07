"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("organization_types", [
      {
        code: "100",
        name: "กรมปศุสัตว์",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "110",
        name: "หน่วยผสมเทียม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "120",
        name: "หน่วยพัฒนาสุขภาพและผลผลิตสัตว์",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "200",
        name: "สหกรณ์",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "300",
        name: "เอกชน",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "400",
        name: "ฟาร์ม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "500",
        name: "ศูนย์รวมนม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "600",
        name: "ศูนย์วิจัยการผสมเทียมและเทคโนโลยีชีวภาพ",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "700",
        name: "สถานีทดสอบสมรรถภาพและฝึกสัตว์พ่อพันธุ์ผสมเทียม",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "800",
        name: "ศูนย์ผลิตน้ำเชื้อแช่แข็งพ่อพันธุ์",
        created_user_id: 1,
        created_datetime: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('organization_types', null, {});
  },
};
