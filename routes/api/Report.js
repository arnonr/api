const router = require("express").Router();
const controllers = require("../../controllers/Report.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");

let resource = "user";

router.get(
  "/",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetAll
);

router.get(
  "/report1",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetReport1
);

router.get(
  "/report2",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetReport2
);

router.get(
  "/report3",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetReport3
);

router.get(
  "/report4",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetReport4
);

router.get(
  "/report5",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetReport5
);

router.get(
  "/report99",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetReport99
);


module.exports = router;
