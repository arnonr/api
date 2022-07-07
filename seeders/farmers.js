"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("farmers", [
      {
        code: "88778947578", 
        name: "อานนท์",
        surname: "รักจักร์",
        idcard: "1100200629414",
        farmerTypeName: 1,
        mhu: null,
        sub_district_id: 1,
        district_id: 1,
        province_id: 1,
        livestockInFarm: "dsdsd",
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
