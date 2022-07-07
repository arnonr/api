"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("group_authorizes", [
      {
        group_id: 1,
        menu_id: 1,
        is_add: 1,
        is_update: 1,
        is_delete: 1,
        is_preview: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        group_id: 1,
        menu_id: 2,
        is_add: 1,
        is_update: 1,
        is_delete: 1,
        is_preview: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        group_id: 1,
        menu_id: 3,
        is_add: 1,
        is_update: 1,
        is_delete: 1,
        is_preview: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        group_id: 1,
        menu_id: 4,
        is_add: 1,
        is_update: 1,
        is_delete: 1,
        is_preview: 1,
        created_user_id: 1,
        created_datetime: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('organization_types', null, {});
  },
};
