"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("personal_datas", {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "เลขไอดีอ้างอิงข้อมูลบุคลากร",
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "รหัสบุคลากร",
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิงผู้ใช้งาน",
      },
      titlename_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงคำนำหน้าชื่อ",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "ชื่อ",
      },
      surname: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "นามสกุล",
      },
      gender: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เพศ",
      },
      birthdate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วันเกิด",
      },
      personal_type_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงประเภทเจ้าหน้าที่",
      },
      position_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงตำแหน่งงาน",
      },
      work_on_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงทำงานเกี่ยวกับ",
      },
      job: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "หน้าที่",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "วันที่เริ่มทำงาน",
      },
      end_date: {
        type: DataTypes.DATE,
        comment: "วันที่สิ้นสุด",
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
      lineid: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "ID Line",
      },
      image_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "รูป",
      },
      idcard: {
        type: DataTypes.STRING(13),
        allowNull: false,
        comment: "เลขบัตรประชาชน",
      },
      organization_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงหน่วยงาน",
      },
      aicenter_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "ศูนย์วิจัยหลัก",
      },
      address: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "ที่อยู่",
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
      status: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: "A",
        comment:
          "W = รออนุมัติ (wait) / A = อนุมัติ (approved) / R = ไม่อนุมัติ (rejected)",
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
      is_username: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: "1 = ผูกกับตาราง user แล้ว, 0 ยังไม่ผูก",
      },
      created_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เลขไอดีอ้างอิงผู้ใช้งาน ที่เพิ่มข้อมูล",
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
        comment: "เลขไอดีอ้างอิงผู้ใช้งาน ที่แก้ไขข้อมูล",
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
