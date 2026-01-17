const express = require("express");
const router = express.Router();
const feeController = require("../controllers/fee.controller");

/* ADD */
router.post("/add", feeController.addFee);

/* GET */
router.get("/:schoolId", feeController.getFees);

/* UPDATE */
router.put("/update/:id", feeController.updateFee);

/* DELETE */
router.delete("/delete/:id", feeController.deleteFee);

module.exports = router;
