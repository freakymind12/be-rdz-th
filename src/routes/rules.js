const express = require("express");
const rulesController = require("../controller/rules");
const { check } = require("express-validator");
const router = express.Router();

router.get("/", rulesController.getRules);
router.post(
  "/",
  [
    check("area").not().isEmpty().withMessage("area is required parameter"),
    check("day").not().isEmpty().withMessage("day is required parameter"),
    check("time00").not().isEmpty().withMessage("time00 is required parameter"),
    check("time06").not().isEmpty().withMessage("time06 is required parameter"),
    check("time12").not().isEmpty().withMessage("time12 is required parameter"),
    check("time18").not().isEmpty().withMessage("time18 is required parameter"),
  ],
  rulesController.addRules
);

router.patch(
  "/:id",
  [
    check("area").not().isEmpty().withMessage("area is required parameter"),
    check("day").not().isEmpty().withMessage("day is required parameter"),
    check("time00").not().isEmpty().withMessage("time00 is required parameter"),
    check("time06").not().isEmpty().withMessage("time06 is required parameter"),
    check("time12").not().isEmpty().withMessage("time12 is required parameter"),
    check("time18").not().isEmpty().withMessage("time18 is required parameter"),
  ],
  rulesController.updateRules
);

router.delete("/:id", rulesController.deleteRules);

module.exports = router;
