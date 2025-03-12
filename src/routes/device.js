const express = require("express");
const router = express.Router();
const deviceController = require("../controller/device");

router.get("/", deviceController.getDevice);

router.patch("/change-parameter", deviceController.updateParameter)

router.patch("/change-area", deviceController.updateArea)

router.patch("/change-group", deviceController.updateGroup)


module.exports = router;
