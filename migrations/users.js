"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example: */
    await queryInterface.createTable("users", {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิง ผู้ใช้งาน",
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "ชื่อบัญชีผู้ใช้งาน",
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "รหัสผ่านผู้ใช้งาน",
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "เบอร์โทรศัพท์",

      },
      group_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงกลุ่มผู้ใช้งาน",
      },
      animal_type_id_lists: {
        type: DataTypes.STRING(30), // ตย 1,2,3
        allowNull: false,
        comment: "เลขไอดีอ้างอิงชนิดสัตว์ที่รับผิดชอบ",
      },
      status: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        comment:
          "W = รออนุมัติ (wait) / A = อนุมัติ (approved) / R = ไม่อนุมัติ (rejected)",
      },
      checked_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วัน-เวลาที่ตรวจสอบข้อมูลผู้ใช้งาน",
      },
      checked_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิงผู้ใช้งาน ที่ตรวจสอบอนุมัติ/ไม่อนุมัติ",
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "เหตุผล (ถ้ามี)",
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
      created_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "วัน-เวลาที่เพิ่มข้อมูล",
      },
      updated_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่แก้ไขข้อมูลล่าสุด",
      },
      updated_datetime: {
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
