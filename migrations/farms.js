"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example: */
    await queryInterface.createTable("farms", {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิง ฟาร์ม",
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "รหัสทะเบียนฟาร์ม",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "ชื่อฟาร์ม",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วันขึ้นทะเบียนฟาร์ม",
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "สถานะฟาร์ม",
      },
      farmer_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง เจ้าของฟาร์ม",
      },
      latitude: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "latitude",
      },
      longtitude: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "longitude",
      },
      link_google_map: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "ลิ้งค์ Google MAP",
      },
      address: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "ที่อยู่",
      },
      zone_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "พื้นที่เขตปศุสัตว์",
      },
      mhu: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "หมู่",
      },
      road: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "ถนน",
      },
      sub_district_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงตำบล",
      },
      district_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงอำเภอ",
      },
      province_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงจังหวัด",
      },
      postal_code: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        comment: "รหัสไปรษณีย์",
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
