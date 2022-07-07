"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example: */
    await queryInterface.createTable("organizations", {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิง หน่วยงาน",
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "รหัสหน่วยงาน",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "ชื่อหน่วยงาน",
      },
      organization_type_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงประเภทหน่วยงาน",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วันที่ขึ้นทะเบียนหน่วยงาน",
      },
      executive: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "ชื่อผู้บริหารหน่วยงาน",
      },
      belongto: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "อยู่ภายใต้หน่วยงาน",
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
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "email",
      },
      telephone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "โทรศัพท์",
      },
      fax: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "แฟ๊กซ์",
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
