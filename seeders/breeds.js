"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("breeds", [
      {
        code: "RD",
        animal_type_id: 1,
        name_th: "เรดเดน",
        name_en: "RED DANE",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "RS",
        animal_type_id: 1,
        name_th: "เรดซินดี้",
        name_en: "RED SINDHI",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "WW",
        animal_type_id: 1,
        name_th: "โฮลสไตน์ ฟรีเชี่ยน(ขาว-แดง)",
        name_en: "RED & WHITE HOLSTEIN",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "RW",
        animal_type_id: 1,
        name_th: "สวีดิชเรดแอนด์ไวท์",
        name_en: "SWEDISH RED & WHITE",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "BR",
        animal_type_id: 2,
        name_th: "บราห์มัน",
        name_en: "BRAHMAN",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "AN",
        animal_type_id: 2,
        name_th: "แองกัสดำ",
        name_en: "ANGUS",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "MI",
        animal_type_id: 3,
        name_th: "เมซานี",
        name_en: "MEHSANA",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "DU",
        animal_type_id: 4,
        name_th: "ดูร็อค",
        name_en: "DUROC",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "NU",
        animal_type_id: 5,
        name_th: "แองโกลนูเบียน",
        name_en: "ANGLO-NUBIAN (NUBIAN)",
        created_user_id: 1,
        created_datetime: new Date(),
      }, {
        code: "BO",
        animal_type_id: 6,
        name_th: "บอนด์",
        name_en: "BOND",
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
