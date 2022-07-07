"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("menus",  {
        id: {
          type: DataTypes.INTEGER(11),
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          comment: "เลขไอดีอ้างอิง เมนู",
        },
        code: {
          type: DataTypes.STRING(30),
          allowNull: false,
          comment: "รหัสเมนู",
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: "ชื่อเมนู",
        },
        sequence: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          comment: "การเรียงลำดับ",
        },
        is_active: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 1,
          comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
        },
      });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
