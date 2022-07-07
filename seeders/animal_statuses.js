"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("animal_statuses", [
      {
        code: "BU",
        animal_type_id: 2,
        name: "โคพ่อพันธุ์",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "CA",
        animal_type_id: 2,
        name: "ลูกโค",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "HI",
        animal_type_id: 2,
        name: "โคสาว",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "CO",
        animal_type_id: 2,
        name: "แม่โค",
        created_user_id: 1,
        created_datetime: new Date(),
      },
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
