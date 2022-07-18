const router = require("express").Router();
const controllers = require("../../controllers/Animal.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");
const { ErrorBadRequest } = require("../../configs/errorMethods");

let resource = "user";

// Image
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "public/uploads/images/animal",
  filename: function (req, file, cb) {
    cb(
      null,
      "animal-" +
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
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGetAll
);

router.get(
  "/generate-number",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGenerateNumber
);

router.post(
  "/generate-breed",
  auth.required,
  checkPermission(resource, "read"),
  controllers.onGenerateBreed
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
  controllers.onInsert
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

// ต้องตรวจสอบอะไรก่อน 1.สิทธิ์ 2.ขนาดไฟล์ ประเภทไฟล์ 3. บันทึกลง Database
router.post(
  "/photo/:id",
  auth.required,
  checkPermission(resource, "update"),
  upload.single("photo_url"),
  controllers.onPhoto
);

module.exports = router;
