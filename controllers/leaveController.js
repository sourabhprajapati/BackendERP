// controllers/leaveController.js
const Leave = require("../models/Leave");

/* ================= CREATE LEAVE (STUDENT) ================= */
exports.createLeave = async (req, res) => {
  try {
    const {
      studentId,
      type,
      fromDate,
      toDate,
      reason,
      isHalfDay
    } = req.body;

    // Calculate days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    let days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    if (isHalfDay === 'true' || isHalfDay === true) {
      days = 0.5;
    }

    // Hardcode schoolId for now (can be fetched from auth or localStorage later)
    const schoolId = "60d5f3f77a5e4b3e8c8e8b3a";

    const leave = await Leave.create({
      schoolId,
      studentId,
      type,
      fromDate,
      toDate,
      days,
      reason,
      isHalfDay: isHalfDay === 'true' || isHalfDay === true,
      attachment: req.file?.path || null,
    });

    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ================= STUDENT HISTORY ================= */
exports.getStudentLeaves = async (req, res) => {
  const { studentId } = req.query;

  const leaves = await Leave.find({ studentId }).sort({ submittedAt: -1 });

  res.json(leaves);
};

/* ================= SCHOOL PANEL ================= */
exports.getSchoolLeaves = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const leaves = await Leave.find({ schoolId }).sort({ submittedAt: -1 });

    // Populate student names
    const StudentDetail = require('../models/StudentDetail');
    const populatedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const student = await StudentDetail.findOne({
          'basic.admissionNo': leave.studentId
        }).select('basic.firstName basic.lastName');

        const name = student ? `${student.basic.firstName} ${student.basic.lastName || ''}`.trim() : leave.studentId;

        return {
          ...leave.toObject(),
          studentName: name
        };
      })
    );

    res.json(populatedLeaves);
  } catch (error) {
    console.error('Error fetching school leaves:', error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= APPROVE / REJECT ================= */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status, remarks },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Populate student name
    const StudentDetail = require('../models/StudentDetail');
    const student = await StudentDetail.findOne({
      'basic.admissionNo': leave.studentId
    }).select('basic.firstName basic.lastName');

    const name = student ? `${student.basic.firstName} ${student.basic.lastName || ''}`.trim() : leave.studentId;

    const populatedLeave = {
      ...leave.toObject(),
      studentName: name
    };

    res.json(populatedLeave);
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ error: error.message });
  }
};
