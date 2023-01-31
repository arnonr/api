const router = require("express").Router();
const controllers = require("../../controllers/Group.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");

let resource = "user";

// router.get("/", controllers.onLogin);

router.get(
  "/", 
  controllers.onGetAll
);
router.get(
  "/:id",
  controllers.onGetById
);

router.post(
  "/",
  controllers.onInsert,
);

router.put(
  "/:id",
  controllers.onUpdate
);

router.delete(
  "/:id",
  // auth.required,
  // checkPermission(resource, "delete"),
  controllers.onDelete
);

module.exports = router;