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
    "/export-excel",
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetExportExcel
  );

router.get("/all-not-event", controllers.onGetAllNotEvent);

router.get("/", controllers.onGetAll);

router.get("/id-and-name", controllers.onGetAllIDandName);

router.get("/generate-number", controllers.onGenerateNumber);

router.get("/get-latest-number", controllers.onGetLatestNumber);

router.get("/generate-breed", controllers.onGenerateBreed);

router.get("/get-by-farm-id", controllers.onGetByFarmID);
router.get("/get-by-farm-id-1", controllers.onGetByFarmID1);

router.get("/update-animal-event", controllers.onUpdateAnimalEvent);
router.get("/update-animal-status", controllers.onUpdateAnimalStatus);

router.get(
  "/update-animal-notification",
  controllers.onUpdateAnimalNotification
);

router.get("/:id", controllers.onGetById);

router.get(
  "/export-registered-animal/:id",
  controllers.onExportRegisteredAnimal
);

// router.post("/photo/:id", upload.single("photo_url"))
// // ,controllers.onPhoto);

router.post(
  "/photo/:id",
  controllers.onPhoto
);

router.post("/", controllers.onInsert);

router.put("/:id", controllers.onUpdate);

router.delete("/:id", controllers.onDelete);
router.delete("/with-check/:id", controllers.onDeleteWithCheck);

// ต้องตรวจสอบอะไรก่อน 1.สิทธิ์ 2.ขนาดไฟล์ ประเภทไฟล์ 3. บันทึกลง Database

module.exports = router;
