// routes/leaveRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  createLeave,
  getStudentLeaves,
  getSchoolLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

router.post("/", upload.single("attachment"), createLeave);
router.get("/", getStudentLeaves);
router.get("/school/:schoolId", getSchoolLeaves);
router.patch("/:id", updateLeaveStatus);

module.exports = router;
