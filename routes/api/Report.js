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
  "/report4",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetReport4
);

module.exports = router;
