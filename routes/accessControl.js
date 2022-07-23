const jwt = require("jsonwebtoken");

const User = require("../models/User");
const GroupAuthorize = require("../models/GroupAuthorize");
const Menu = require("../models/Menu");

// Menu is Resource
// IsAdd IsUpdate IsDelete IsPreview is Action

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    let permission = false;

    const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
    const user = await User.findByPk(decoded.id);

    // Resource
    const menu = await Menu.findOne({ where: { MenuCode: resource } });

    $where = {};
    $where["GroupID"] = user.GroupID;
    // $where["MenuID"] = menu.MenuID;

    if (action === "create") {
      $where["IsAdd"] = 1;
    }

    if (action === "update") {
      $where["IsUpdate"] = 1;
    }

    if (action === "delete") {
      $where["IsDelete"] = 1;
    }

    if (action === "read") {
      $where["IsPreview"] = 1;
    }

    // const groupAuthorize = await GroupAuthorize.findOne({
    //   where: $where,
    // });

    // if (groupAuthorize) {
    //   permission = true;
    // }
    permission = true;
    if (permission === true) {
      next();
      return;
    }

    res.status(405).send({
      error: {
        status: 405,
        message: "Method Not Allowed",
      },
    });
  };
};

exports.checkPermission = checkPermission;

// let grantsObject = {
//   ADMIN: {
//     user: {
//       "create:any": ["*"],
//       "update:any": ["*"],
//       "delete:any": ["*"],
//       "read:any": ["*"],
//     },
//     COW: {
//       "create:any": ["*"],
//       "update:any": ["*"],
//       "delete:any": ["*"],
//       "read:any": ["*"],
//     },
//     // video: {
//     //   "create:own": ["*", "!rating", "!views"],
//     //   "read:own": ["*"],
//     //   "update:own": ["*", "!rating", "!views"],
//     //   "delete:own": ["*"],
//     // },
//   },
//   USER: {
//     cow: {
//       // "create:any": ["*"],
//       // "update:any": ["*"],
//       // "delete:any": ["*"],
//       "read:any": ["*"],
//     },
//   },
// };
// const ac = new AccessControl(grantsObject);
// if (action === "create") {
//   permission = ac.can().role(decoded.role).create(resource);
// }

// if (action === "update") {
//   permission = ac.can().role(decoded.role).update(resource);
// }

// if (action === "delete") {
//   permission = ac.can().role(decoded.role).delete(resource);
// }

// if (action === "read") {
//   permission = ac.can().role(decoded.role).read(resource);
// }

// if (permission.granted) {
//   next();
//   return;
// }
// throw ErrorMethodNotAllowed("Method Not Allowed");
