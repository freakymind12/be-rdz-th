const express = require("express");
const reportController = require("../controller/report");
const { query } = require("express-validator");
const router = express.Router();

router.get(
  "/",
  // [
  //   query("year").not().isEmpty().withMessage("year is required parameter"),
  //   query("month").not().isEmpty().withMessage("month is required parameter"),
  // ],
  reportController.getReport
);
router.post("/generate-daily-report", reportController.generateDailyReport);

router.get(
  "/download",
  [
    query("year").not().isEmpty().withMessage("year is required parameter"),
    query("month").not().isEmpty().withMessage("month is required parameter"),
  ],
  reportController.downloadReport
);

module.exports = router;
