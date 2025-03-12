const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const groupController = require("../controller/group");

router.post(
  "/",
  [check("name").not().isEmpty().withMessage("name is required")],
  groupController.addGroup
);
router.patch(
  "/:id",
  [check("name").not().isEmpty().withMessage("name is required")],
  groupController.editGroup
);
router.delete("/:id", groupController.deleteGroup);
router.get("/", groupController.getGroup);

module.exports = router;
