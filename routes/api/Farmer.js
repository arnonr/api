const router = require("express").Router();
const controllers = require("../../controllers/Farmer.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");

let resource = "user";


router.get(
  "/",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetAll
);

router.get(
  "/fetch-api-farmer",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onfetchAPIFarmer
);


router.get(
  "/:id",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetById
);

router.post(
  "/",
  // auth.required,
  // checkPermission(resource, "create"),
  controllers.onInsert,
);

router.put(
  "/:id",
  // auth.required,
  // checkPermission(resource, "update"),
  controllers.onUpdate
);

router.delete(
  "/:id",
  // auth.required,
  // checkPermission(resource, "delete"),
  controllers.onDelete
);

module.exports = router;