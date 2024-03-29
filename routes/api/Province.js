const router = require("express").Router();
const controllers = require("../../controllers/Province.controller");
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
  "/selection",
  cacheMiddleware,
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetSelection
);

router.get(
  "/",
  // auth.required,
  // checkPermission(resource, "read"),
  controllers.onGetAll
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
