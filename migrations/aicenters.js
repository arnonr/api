'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    await queryInterface.createTable("aicenters", {
        id: {
          type: DataTypes.INTEGER(11),
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          comment: "เลขไอดีอ้างอิง ศูนย์วิจัย",
        },
        code: {
          type: DataTypes.STRING(30),
          allowNull: false,
          comment: "รหัสศูนย์วิจัยการผสมเทียม",
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: "ชื่อศูนย์วิจัยการผสมเทียม",
        },
        address: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: "ที่ตั้ง",
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
          comment: "เลขไอดีอ้างอิง ตำบล",
        },
        district_id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          comment: "เลขไอดีอ้างอิง อำเภอ",
        },
        province_id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          comment: "เลขไอดีอ้างอิง จังหวัด",
        },
        postal_code: {
          type: DataTypes.INTEGER(5),
          allowNull: false,
          comment: "รหัสไปรษณีย์",
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: "อีเมล",
        },
        telephone: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: "หมายเลขโทรศัพท์",
        },
        fax: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: "แฟกซ์",
        },
        is_active: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 1,
          comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
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

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
