"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("embryo_stages", [
      {
        name: "Morula",
        is_alive: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        name: "Compact-morula",
        is_alive: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        name: "Early-blastocyst",
        is_alive: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        name: "blastocyst",
        is_alive: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        name: "Expanding blastocyst",
        is_alive: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        name: "Hatching blastocyst",
        is_alive: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        name: "Ufo",
        is_alive: 2,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        name: "Degenerated oocyte",
        is_alive: 2,
        created_user_id: 1,
        created_datetime: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('organization_types', null, {});
  },
};
