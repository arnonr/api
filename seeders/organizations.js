"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("organizations", [
      {
        code: "107560200",
        name: "หน่วยผสมเทียมกรุงเทพมหานคร (หนองจอก)",
        organization_type_id: 1,
        start_date: new Date(),
        executive: "นายอานนท์ รักจักร์",
        belongto: null,
        address: "",
        zone_id: 1,
        mhu: "",
        road: "",
        sub_district_id: 1,
        district_id: 1,
        province_id: 1,
        postal_code: '10100',
        email: "",
        fax: "",
        telephone: "",
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
