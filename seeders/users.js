"use strict";

const crypto = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        username: "arnon.r@tgde.kmutnb.ac.th",
        password: crypto.createHash("sha1").update("123456789").digest("hex"),
        phone: "0802112900",
        group_id: 1,
        animal_type_id_lists: "1,2,3,4,5,6,7,8,9,10",
        status: "A",
        checked_datetime: new Date(),
        checked_user_id: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('users', null, {});
  },
};
