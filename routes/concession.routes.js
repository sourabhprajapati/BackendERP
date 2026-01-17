const express = require("express");
const router = express.Router();
const concessionController = require("../controllers/concession.controller");

/* ADD */
router.post("/add", concessionController.addConcession);

/* GET */
router.get("/:schoolId", concessionController.getConcessions);

/* UPDATE */
router.put("/update/:id", concessionController.updateConcession);

/* DELETE */
router.delete("/delete/:id", concessionController.deleteConcession);

module.exports = router;
