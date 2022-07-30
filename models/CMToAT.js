const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class CMToAT extends Model {
  static associate(models) {}
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

CMToAT.init(
  {
    CMToATID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "CMToAT",
  }
);

module.exports = CMToAT;
