const express = require("express");
const router = express.Router();

const {
  saveLateFeeConfig,
  getLateFeeConfig,
  deleteLateFeeConfig,
} = require("../controllers/lateFee.controller");

/* CREATE / UPDATE */
router.post("/save", saveLateFeeConfig);

/* GET */
router.get("/:schoolId", getLateFeeConfig);

/* DELETE */
router.delete("/:schoolId", deleteLateFeeConfig);

module.exports = router;
