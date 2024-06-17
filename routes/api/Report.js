const router = require("express").Router();
const controllers = require("../../controllers/Report.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");
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

router.get(
    "/report99",
    cacheMiddleware,
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
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport1
);

router.get(
    "/report2",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport2
);

router.get(
    "/report3",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport3
);

router.get(
    "/report4",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport4
);

router.get(
    "/report5",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport5
);

router.get(
    "/report6",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport6
);

router.get(
    "/report7",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport7
);

router.get(
    "/report8",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport8
);

router.get(
    "/report9",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport9
);

router.get(
    "/report9-1",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport91
);

router.get(
    "/report10",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport10
);

router.get(
    "/report11",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport11
);

router.get(
    "/report12",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport12
);

router.get(
    "/report13",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport13
);

router.get(
    "/report14",
    cacheMiddleware,
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
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport18
);

router.get(
    "/report19",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport19
);

router.get(
    "/report20",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport20
);

router.get(
    "/report21",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport21
);

router.get(
    "/report22",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport22
);

router.get(
    "/report23",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport23
);

router.get(
    "/report24",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport24
);

router.get(
    "/report25",
    cacheMiddleware,
    // auth.required,
    // checkPermission(resource, "read"),
    controllers.onGetReport25
);

router.get(
    "/report26",
    cacheMiddleware,
    controllers.onGetReport26
);

router.get(
    "/report27",
    cacheMiddleware,
    controllers.onGetReport27
);


router.get(
    "/report28",
    cacheMiddleware,
    controllers.onGetReport28
);


router.get(
    "/report29",
    cacheMiddleware,
    controllers.onGetReport29
);




// generate FarmAnimalType
router.get("/report101", cacheMiddleware, controllers.onGetReport101);

router.get("/report15", cacheMiddleware, controllers.onGetReport15);

module.exports = router;
