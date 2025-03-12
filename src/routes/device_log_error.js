const express = require("express");
const router = express.Router();
const deviceLogController = require("../controller/device_log_error");

router.get("/", deviceLogController.getLogError);

module.exports = router;
