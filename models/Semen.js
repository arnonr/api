const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Semen extends Model {
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Semen.init(
  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง น้ำเชื้อ",
    },
    semen_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "หมายเลขน้ำเชื้อ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Semen.findOne({ where: { semen_number: value, is_remove: 0 } })
            .then(function (data) {
              if (data && self.id !== data.id) {
                throw new Error("semen number already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ชุดน้ำเชื้อ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Semen.findOne({ where: { code: value, is_remove: 0 } })
            .then(function (data) {
              if (data && self.id !== data.id) {
                throw new Error("code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อน้ำเชื้อ",
    },
    animal_type_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ประเภทสัตว์",
    },
    animal_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง สัตว์",
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
    source_type: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "แหล่งที่มาของน้ำเชื้อ, 1- ABOARD, 2-GOV, 3-PRIVATE",
    },
    semen_sexing: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "1 - น้ำเชื้อแยกเพศ, 2- น้ำเชื้อคละเพศ",
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ประเทศ",
    },
    source_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "แหล่งที่มา",
    },
    organization_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง หน่วยงาน",
    },
    produce_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่ผลิิต",
    },
    semen_type: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ชนิดน้ำเชื้อ 1 - FRESH, 2- FREEZE",
    },
    capacity: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "ขนาดหลอด",
    },
    product_quantity: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "จำนวนหลอดผลิต",
    },
    after_thawing_percent: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "%การเคลื่อนที่หลังแช่แข็ง",
    },
    color_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "สีหลอด",
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิงผู้รับผิดชอบ",
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
  },
  {
    sequelize,
    timestamps: true,
    modelName: "semen",
  }
);

module.exports = Semen;
