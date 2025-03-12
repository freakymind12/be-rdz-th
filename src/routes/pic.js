const express = require("express");
const picController = require("../controller/pic");
const { check } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  [check("email").not().isEmpty().isEmail().withMessage("email is required")],
  picController.addPic
);

router.get("/", picController.getPic);

router.patch(
  "/:id",
  [check("email").not().isEmpty().isEmail().withMessage("email is required")],
  picController.updatePic
);

router.delete("/:id", picController.deletePic);

router.post("/assign", picController.assignPic, [
  check("pic_id")
    .isArray()
    .notEmpty()
    .withMessage("select at least one of pic in the list"),
  check("group_id").notEmpty().withMessage("group_id is required"),
]);

router.delete("/assign/:id", picController.unassignPic);

module.exports = router;
