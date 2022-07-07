"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("update_personal_data_logs", {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิงประวัติการปรับปรุงข้อมูลส่วนตัว",
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงผู้ใช้งาน",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "รายละเอียดการแก้ไข",
      },
      status: {
          type: DataTypes.CHAR(1),
          allowNull: false,
          comment: "W = รออนุมัติ (wait) / A = อนุมัติ (approved) / R = ไม่อนุมัติ (rejected)"
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "เหตุผล (ถ้ามี)"
      },
      checked_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วัน-เวลาที่ตรวจสอบข้อมูลผู้ใช้งาน",
      },
      checked_user_id: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "เลขไอดีอ้างอิงผู้ใช้งาน ที่ตรวจสอบอนุมัติ/ไม่อนุมัติ",
      },
      created_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงผู้ใช้งาน ที่ปรับปรุงข้อมูล",
      },
      created_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "วัน-เวลาที่บันทึก log / วัน-เวลาที่ปรับปรุงข้อมูล",
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
