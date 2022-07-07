"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("Province", {
      ProvinceID: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิง จังหวัด",
      },
      ProvinceCode: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "รหัสจังหวัด",
      },
      ProvinceName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "ชื่อจังหวัด (ภาษาไทย)",
      },
      ProvinceNameEN: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "ชื่อจังหวัด (ภาษาอังกฤษ)",
      },
      RegionID: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "รหัสอ้างอิงภาค",
      },
      OrganizationZoneID: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "รหัสอ้างอิงเขตพื้นที่",
      },
      AIZoneID: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "รหัสอ้างอิงศูนย์วิจัย",
      },
      isActive: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
      },
      isRemove: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: "1 = ถูกลบ",
      },
      createdUserID: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
      },
      createdAt: {
        field: "createdDatetime",
        type: DataTypes.DATE,
        allowNull: false,
        comment: "วัน-เวลาที่เพิ่มข้อมูล",
      },
      UpdatedUserID: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่แก้ไขข้อมูลล่าสุด",
      },
      updatedAt: {
        field: "updatedDatetime",
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
