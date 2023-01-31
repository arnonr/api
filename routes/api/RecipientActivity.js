const router = require("express").Router();
const controllers = require("../../controllers/RecipientActivity.controller");
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
  "/find-recipient",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetAllRecipient
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

router.put(
  "/exclude-recipient/:id",
  // auth.required,
  // checkPermission(resource, "update"),
  controllers.onExcludeRecipient
);

router.put(
  "/include-recipient/:id",
  // auth.required,
  // checkPermission(resource, "update"),
  controllers.onIncludeRecipient
);

router.delete(
  "/:id",
  // auth.required,
  // checkPermission(resource, "delete"),
  controllers.onDelete
);

module.exports = router;