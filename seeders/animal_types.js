"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("animal_types", [
      {
        code: "01",
        name_th: "โคนม",
        name_en: "dairy cattle",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "02",
        name_th: "โคเนื้อ",
        name_en: "beef cattle",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "03",
        name_th: "กระบือ",
        name_en: "buffalo",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "04",
        name_th: "สุกร",
        name_en: "swine",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "05",
        name_th: "แพะ",
        name_en: "goat",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "06",
        name_th: "แกะ",
        name_en: "sheep",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "07",
        name_th: "แมว",
        name_en: "cat",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "08",
        name_th: "สุนัข",
        name_en: "dog",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "09",
        name_th: "ไก่",
        name_en: "chicken",
        created_user_id: 1,
        created_datetime: new Date(),
      },{
        code: "10",
        name_th: "ม้า",
        name_en: "horse",
        created_user_id: 1,
        created_datetime: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('organization_types', null, {});
  },
};
