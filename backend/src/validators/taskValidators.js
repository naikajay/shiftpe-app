const { body, param, query } = require("express-validator");

const PAY_TYPES = ["hourly", "daily", "fixed"];
const TASK_STATUSES = ["draft", "open", "full", "in_progress", "completed", "cancelled"];
const SORT_OPTIONS = ["startTime", "payAmount", "createdAt", "distance"];

const locationValidators = (field = "location") => [
  body(`${field}.type`).equals("Point").withMessage(`${field}.type must be Point`),
  body(`${field}.coordinates`)
    .isArray({ min: 2, max: 2 })
    .withMessage(`${field}.coordinates must be [longitude, latitude]`),
  body(`${field}.coordinates.0`)
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between -180 and 180")
    .toFloat(),
  body(`${field}.coordinates.1`)
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude must be between -90 and 90")
    .toFloat(),
];

const createTaskValidation = [
  body("title").trim().isLength({ min: 3, max: 120 }),
  body("description").trim().isLength({ min: 10, max: 2000 }),
  body("category").trim().isLength({ min: 2, max: 80 }).toLowerCase(),
  body("payAmount").isFloat({ min: 0 }).toFloat(),
  body("payType").isIn(PAY_TYPES),
  body("workersNeeded").isInt({ min: 1, max: 500 }).toInt(),
  body("startTime").isISO8601().toDate(),
  body("endTime")
    .isISO8601()
    .toDate()
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error("endTime must be after startTime");
      }

      if (new Date(endTime) <= new Date()) {
        throw new Error("endTime must be in the future");
      }

      return true;
    }),
  ...locationValidators("location"),
  body("address").trim().isLength({ min: 3, max: 300 }),
];

const nearbyTasksValidation = [
  query("category").optional().trim().isLength({ min: 1, max: 80 }).toLowerCase(),
  query("payType").optional().isIn(PAY_TYPES),
  query("minPay").optional().isFloat({ min: 0 }).toFloat(),
  query("maxPay").optional().isFloat({ min: 0 }).toFloat(),
  query("longitude").optional().isFloat({ min: -180, max: 180 }).toFloat(),
  query("latitude").optional().isFloat({ min: -90, max: 90 }).toFloat(),
  query("radiusKm").optional().isFloat({ min: 0.1, max: 100 }).toFloat(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("sortBy").optional().isIn(SORT_OPTIONS),
  query().custom((_, { req }) => {
    const hasAnyGeo =
      req.query.longitude !== undefined ||
      req.query.latitude !== undefined ||
      req.query.radiusKm !== undefined;

    if (hasAnyGeo) {
      if (
        req.query.longitude === undefined ||
        req.query.latitude === undefined ||
        req.query.radiusKm === undefined
      ) {
        throw new Error("longitude, latitude and radiusKm must be provided together");
      }
    }

    if (
      req.query.minPay !== undefined &&
      req.query.maxPay !== undefined &&
      Number(req.query.minPay) > Number(req.query.maxPay)
    ) {
      throw new Error("minPay cannot be greater than maxPay");
    }

    return true;
  }),
];

const taskIdValidation = [param("taskId").isMongoId().withMessage("taskId must be valid")];

const updateTaskStatusValidation = [
  ...taskIdValidation,
  body("status").isIn(["open", "completed", "cancelled"]),
];

const swipeFeedValidation = [
  query("longitude").optional().isFloat({ min: -180, max: 180 }).toFloat(),
  query("latitude").optional().isFloat({ min: -90, max: 90 }).toFloat(),
  query("radiusKm").optional().isFloat({ min: 0.1, max: 100 }).toFloat(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 20 }).toInt(),
  query().custom((_, { req }) => {
    const hasLongitude = req.query.longitude !== undefined;
    const hasLatitude = req.query.latitude !== undefined;

    if (hasLongitude !== hasLatitude) {
      throw new Error("longitude and latitude must be provided together");
    }

    return true;
  }),
];

module.exports = {
  PAY_TYPES,
  TASK_STATUSES,
  SORT_OPTIONS,
  createTaskValidation,
  nearbyTasksValidation,
  taskIdValidation,
  updateTaskStatusValidation,
  swipeFeedValidation,
};
