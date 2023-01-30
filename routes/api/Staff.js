const router = require("express").Router();
const controllers = require("../../controllers/Staff.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");
const { ErrorBadRequest } = require("../../configs/errorMethods");

let resource = "user";

// Image
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "public/uploads/images/staff",
  filename: function (req, file, cb) {
    cb(
      null,
      "staff-" +
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
  "/",
  checkPermission(resource, "read"),
  controllers.onGetAll
);

router.get(
  "/:id",
  checkPermission(resource, "read"),
  controllers.onGetById
);

router.post(
  "/",
  checkPermission(resource, "create"),
  controllers.onInsert
);

router.put(
  "/:id",
  checkPermission(resource, "update"),
  controllers.onUpdate
);

router.delete(
  "/:id",
  auth.required,
  checkPermission(resource, "delete"),
  controllers.onDelete
);

// ต้องตรวจสอบอะไรก่อน 1.สิทธิ์ 2.ขนาดไฟล์ ประเภทไฟล์ 3. บันทึกลง Database
router.post(
  "/photo/:id",
  checkPermission(resource, "update"),
  upload.single("photo_url"),
  controllers.onPhoto
);

router.get(
  "/staff-by-number/:id",
  controllers.onGetByStaffNumber
);


router.put(
  "/:id/mobile-phone",
  controllers.onUpdateMobilePhone
);

module.exports = router;
