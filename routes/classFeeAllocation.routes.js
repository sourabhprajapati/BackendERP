const express = require("express");
const router = express.Router();
const controller = require("../controllers/classFeeAllocation.controller");

/* GET */
router.get("/:schoolId/:className", controller.getClassFeeAllocation);

/* SAVE */
router.post("/save", controller.saveClassFeeAllocation);

module.exports = router;
