"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("farms", [
      {
        code: "4705006739", 
        name: "ฟาร์มนนทบุรี",
        start_date: new Date(),
        status: 1,
        farmer_id: null,
        latitude: null,
        longtitude: null,
        link_google_map: null,
        address: null,
        zone_id: 1,
        mhu: null,
        road: null,
        sub_district_id: 1,
        district_id: 1,
        province_id: 1,
        postal_code: "10100",
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
