"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("personal_datas", [
      {
        code: "H001",
        user_id: 1,
        titlename_id: 1,
        name: "อานนท์",
        surname: "รักจักร์",
        gender: 1,
        birthdate: new Date(),
        personal_type_id: 1,
        position_id: 1,
        work_on_id: 1,
        job: "โปรแกรมเมอร์",
        start_date: new Date(),
        email: "arnon.r@tgde.kmutnb.ac.th",
        telephone: "0802112900",
        idcard: "1100200629414",
        organization_id: 1,
        sub_district_id: 1,
        district_id: 1,
        province_id: 1,
        postal_code: 10100,
        status: "A",
        created_user_id: 1,
        created_datetime: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('users', null, {});
  },
};
