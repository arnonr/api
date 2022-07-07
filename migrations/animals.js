"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example: */
    await queryInterface.createTable("animals", {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิง สัตว์",
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "เลขอ้างอิงสัตว์ (ระบบ Generate แยกตามชนิดสัตว์)",
      },
      ear_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "เลขอ้างอิงหมายเลขที่ติดใบหู",
      },
      nid_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "เลขอ้างอิง NID",
      },
      rfid_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "เลขอ้างอิง RFID",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "ชื่อสัตว์",
      },
      animal_type_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิง ประเภทสัตว์",
      },
      breed_1_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง สายพันธุ์ที่ 1",
      },
      breed_1_percent: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เปอร์เซ็นต์ สายพันธุ์ที่ 1",
      },
      breed_2_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง สายพันธุ์ที่ 2",
      },
      breed_2_percent: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เปอร์เซ็นต์ สายพันธุ์ที่ 2",
      },
      breed_3_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง สายพันธุ์ที่ 3",
      },
      breed_3_percent: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เปอร์เซ็นต์ สายพันธุ์ที่ 3",
      },
      breed_4_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง สายพันธุ์ที่ 4",
      },
      breed_4_percent: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เปอร์เซ็นต์ สายพันธุ์ที่ 4",
      },
      breed_5_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง สายพันธุ์ที่ 5",
      },
      breed_5_percent: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เปอร์เซ็นต์ สายพันธุ์ที่ 5",
      },
      image_path: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "รูปสัตว์",
      },
      birthdate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วันเกิด",
      },
      gender: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "เพศสัตว์",
      },
      animal_source: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง แหล่งที่มา",
      },
      source_detail: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "แหล่งที่มากรณีกำหนดเอง",
      },
      farm_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง ฟาร์ม",
      },
      animal_status_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง สถานะสัตว์",
      },
      project_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "เลขไอดีอ้างอิง โครงการ (1,2,3)",
      },
      born_type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "รูปแบบการเกิด",
      },
      artificial_insemination_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง การผสมเทียม",
      },
      normal_breed_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง การผสมพันธุ์",
      },
      embryo_breed_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง การฝากตัวอ่อน",
      },
      weight: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "น้ำหนักแรกเกิด",
      },
      personal_data_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิง เจ้าหน้าที่ผู้ดูแล",
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
