const router = require("express").Router();
const controllers = require("../../controllers/Farm.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");
const { ErrorBadRequest } = require("../../configs/errorMethods");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // cache 1 ชั่วโมง

let resource = "user";

function cacheMiddleware(req, res, next) {
  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log(`Cache hit for ${key}`);
    res.send(cachedResponse);
  } else {
    console.log(`Cache miss for ${key}`);
    res.originalSend = res.send;
    res.send = (body) => {
      res.originalSend(body);
      cache.set(key, body);
    };
    next();
  }
}

// Image
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "public/uploads/images/farm",
  filename: function (req, file, cb) {
    cb(
      null,
      "farm-" +
        req.params.id +
        "-" +
        Date.now() +
        path.extname(file.originalname)
      // path.parse(file.originalname).name + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(ErrorBadRequest("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: { fieldSize: 10 * 1024 * 1024 }, //10MB
});

router.get(
  "/generate-number",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGenerateNumber
);

router.get(
  "/export-excel",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetExportExcel
);

router.get(
  "/export-excel-with-farmer",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetExportExcelWithFarmer
);

router.get(
  "/",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetAll
);

router.get(
    "/get-by-farmer",
    //   cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetByFarmer
  );
  

router.get(
  "/selection",
  //   cacheMiddleware,
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetSelection
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

// ต้องตรวจสอบอะไรก่อน 1.สิทธิ์ 2.ขนาดไฟล์ ประเภทไฟล์ 3. บันทึกลง Database
router.post(
  "/photo/:id",
  // auth.required,
  // checkPermission(resource, "update"),
  upload.single("photo_url"),
  controllers.onPhoto
);

module.exports = router;
