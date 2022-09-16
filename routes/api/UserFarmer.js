const router = require("express").Router();
const controllers = require("../../controllers/UserFarmer.controller");
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
  "/authorize",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onAuthorize
);

router.get(
  "/check-permission",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onCheckPermission
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

router.get(
  "/user-by-staff-id/:id",
  controllers.onGetByStaffID
);

module.exports = router;