const router = require("express").Router();
const controllers = require("../../controllers/AI.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");

let resource = "user";

router.get(
    "/with-animal",
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetWithAnimal
);

router.get(
    "/",
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetAll
);

router.get(
    "/get-by-nid/:id",
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetByNID
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
    controllers.onInsert
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
