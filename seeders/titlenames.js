"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("titlenames", [
      {
        name: "นาย",
        created_user_id: 1,
        created_datetime: new Date(),
      },
      {
        name: "นาง",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        name: "นางสาว",
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
