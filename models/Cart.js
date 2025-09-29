const { Model, DataTypes } = require("sequelize"),
    { sequelize } = require("../configs/databases");

class Cart extends Model {
    static associate(models) {
        this.belongsTo(models.Animal, {
            as: "Animal", // เพิ่ม alias
            foreignKey: "AnimalID",
        });

        this.belongsTo(models.User, {
            as: "User", // เพิ่ม alias
            foreignKey: "UserID",
        });
    }
    // Custom JSON Response
    toJSON() {
        return {
            ...this.get(),
        };
    }
}

Cart.init(
    {
        CartID: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            comment: "เลขไอดีอ้างอิง ตะกร้า",
        },
        AnimalID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "รหัสอ้างอิงสัตว์",
        },
        UserID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "รหัสอ้างอิงผู้ใช้งาน",
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
        CreatedUserID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
        },
        createdAt: {
            field: "CreatedDatetime",
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
            field: "UpdatedDatetime",
            type: DataTypes.DATE,
            allowNull: true,
            comment: "วัน-เวลาที่แก้ไขข้อมูลล่าสุด",
        },
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        modelName: "Cart",
    }
);

module.exports = Cart;
