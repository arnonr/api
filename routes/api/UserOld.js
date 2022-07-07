const router = require("express").Router();
const controllers = require("../../controllers/User.controller");
const personalDatasControllers = require("../../controllers/personalData.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");
// const {
//   ErrorBadRequest,
// } = require("../../configs/errorMethods");

// const validator = require("../../validators");
let resource = "user";

router.get(
  "/",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetAll
);
router.get(
  "/:id",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetById
);

router.post(
  "/",
  auth.required,
  checkPermission(resource, "create"),
  controllers.onInsert,
  personalDatasControllers.onInsert,
);

router.put(
  "/:id",
  auth.required,
  checkPermission(resource, "update"),
  controllers.onUpdate
);

router.delete(
  "/:id",
  auth.required,
  checkPermission(resource, "delete"),
  controllers.onDelete
);

router.post("/login", controllers.onLogin);
router.post("/register", controllers.onRegister);
router.post("/refresh-token", controllers.onRefreshToken);

module.exports = router;
// Permission
