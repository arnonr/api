"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example: */
    await queryInterface.createTable("breeds", {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิง สายพันธุ์",
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "รหัสสายพันธุ์",
      },
      name_th: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "ชื่อสายพันธุ์ TH",
      },
      name_en: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "ชื่อสายพันธุ์ EN",
      },
      animal_type_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิง ประเภทสัตว์",
      },
      is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
      },
      is_remove: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: "1 = ถูกลบ",
      },
      created_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
      },
      createdAt: {
        field: "created_datetime",
        type: DataTypes.DATE,
        allowNull: false,
        comment: "วัน-เวลาที่เพิ่มข้อมูล",
      },
      updated_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่แก้ไขข้อมูลล่าสุด",
      },
      updatedAt: {
        field: "updated_datetime",
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วัน-เวลาที่แก้ไขข้อมูลล่าสุด",
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
