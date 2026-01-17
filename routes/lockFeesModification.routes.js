const express = require("express");
const router = express.Router();

const {
  lockFees,
  getLockFees,
  deleteLockFees,
} = require("../controllers/lockFeesModification.controller");

/* CREATE / UPDATE */
router.post("/lock", lockFees);

/* GET */
router.get("/:schoolId", getLockFees);

/* DELETE */
router.delete("/:schoolId", deleteLockFees);

module.exports = router;
