const router = require("express").Router();
const controllers = require("../../controllers/Report.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");

let resource = "user";

router.get(
  "/report99",
  // checkPermission(resource, "read"),
  controllers.onGetReport99
);

router.get(
  "/",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetAll
);

router.get(
  "/report1",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport1
);

router.get(
  "/report2",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport2
);

router.get(
  "/report3",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport3
);

router.get(
  "/report4",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport4
);

router.get(
  "/report5",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport5
);

router.get(
  "/report6",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport6
);

router.get(
  "/report7",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport7
);

router.get(
  "/report8",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport8
);

router.get(
  "/report9",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport9
);

router.get(
  "/report9-1",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport91
);

router.get(
  "/report10",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport10
);

router.get(
  "/report11",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport11
);

router.get(
  "/report12",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport12
);

router.get(
  "/report13",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport13
);

router.get(
  "/report14",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport14
);

router.get(
  "/report17",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport17
);

router.get(
  "/report18",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport18
);

router.get(
  "/report19",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetReport19
);

router.get("/report15", controllers.onGetReport15);

module.exports = router;
