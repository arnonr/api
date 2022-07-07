const { Model, DataTypes } = require("sequelize"),
  crypto = require("crypto"),
  jwt = require("jsonwebtoken"),
  config = require("../configs/app"),
  { sequelize } = require("../configs/databases");

class Users extends Model {
  static associate(models) {
    this.hasOne(models.PersonalDatas, {
      foreignKey: "id",
      as: "PersonalDatas",
    });
    this.belongsTo(models.Groups, { foreignKey: "group_id", as: "Groups" });
  }

  // Generate JWT
  generateJWT(obj) {
    let today = new Date(),
      exp = new Date(today);
    // exp.setDate(today.getDate() + config.token_exp_days || 1);
    exp.setMinutes(today.getMinutes() + 60);

    // find group ID หริือ join
    return jwt.sign(
      {
        id: this.id,
        username: this.username,
        role: this.Groups.code,
        exp: parseInt(exp.getTime() / 1000),
      },
      config.secret
    );
  }

  getFullname() {
    return [this.name, this.surname].join(" ");
  }

  // Custom JSON Response
  toJSON() {
    // ถ้าฟิลด์ไหนไม่เอาก็ undefined
    return {
      ...this.get(),
      //   id: this.id,
      //   username: this.username,
      //   //   name: this.firstname,
      //   //   surname: this.surname,
      //   //   photo_url:
      //   //     (this.photo_url) ? "http://localhost:3000/static/uploads/images/users/"+this.photo_url : "http://localhost:3000/static/uploads/images/users/",
      //   //   birthday: this.birthday,
      //   createdDatetime: this.createdAt,
      //   updatedDatetime: this.updatedAt,
    };
  }

  // Hash Password
  passwordHash(password) {
    return crypto.createHash("sha1").update(password).digest("hex");
  }

  // Verify Password
  validPassword(password) {
    return this.passwordHash(password) === this.password;
  }
}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Users.findOne({ where: { username: value, is_active: 1 } })
            .then(function (user) {
              if (user && self.id !== user.id) {
                throw new Error("Username already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    group_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    animal_type_id_lists: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    status: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    checked_datetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checked_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
    created_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    // created_datetime: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
    createdAt: {
      field: "created_datetime",
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    // updated_datetime: {
    //   type: DataTypes.DATE,
    // },
    updatedAt: {
      field: "updated_datetime",
      type: DataTypes.DATE,
      allowNull: true,
    },

    // fullName: {
    //   type: DataTypes.VIRTUAL,
    //   get() {
    //     return `${this.firstName} ${this.lastName}`;
    //   },
    //   set(value) {
    //     throw new Error("Do not try to set the `fullName` value!");
    //   },
    // },
    // email: {
    //   type: DataTypes.STRING(255),
    //   allowNull: false,
    //   validate: {
    //     isEmail: true,
    //   },
    // },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "users",
    // hooks: {
    //   beforeSave: (user) => {
    //     //  user
    //   },
    // },
  }
);

// (async () => {
//   await sequelize.sync();
//   // Code here
// })();

module.exports = Users;
