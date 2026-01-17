// controllers/staffLeaveController.js
const StaffLeave = require('../models/StaffLeave');
const Staff = require('../models/Staff');
const multer = require('multer');
const path = require('path');

// Multer configuration for leave attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/staff-leave-attachments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `staff-leave-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|xls|xlsx|txt|ppt|pptx|jpg|jpeg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Invalid file type. Allowed: pdf, doc, xls, txt, ppt, images'));
  }
}).single('attachment');

// Submit new leave application
const applyLeave = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const {
        schoolId,
        staffId,
        leaveType,
        fromDate,
        fromSession,
        toDate,
        toSession,
        days,
        reason,
        contactDetails,
        appliedBy = 'Admin' // change when auth is added
      } = req.body;

      if (!schoolId || !staffId || !leaveType || !fromDate || !toDate || !days || !reason) {
        return res.status(400).json({ success: false, message: 'Required fields missing' });
      }

      const staff = await Staff.findOne({ _id: staffId, schoolId });
      if (!staff) {
        return res.status(403).json({ success: false, message: 'Staff not found or unauthorized' });
      }

      const leave = new StaffLeave({
        staff: staffId,
        schoolId,
        leaveType,
        fromDate,
        fromSession: fromSession || 'Full Day',
        toDate,
        toSession: toSession || 'Full Day',
        days: parseFloat(days),
        reason,
        contactDetails,
        attachment: req.file?.filename,
        appliedBy,
        status: 'Pending'
      });

      await leave.save();

      res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        data: leave
      });

    } catch (error) {
      console.error('Staff Leave Apply Error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};

// Get all pending leave requests
const getPendingLeaves = async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId required' });

    const leaves = await StaffLeave.find({ schoolId, status: 'Pending' })
      .populate('staff', 'employeeName employeeUserName designation department')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get leave history (optionally filtered by staff)
const getLeaveHistory = async (req, res) => {
  try {
    const { schoolId, staffId } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId required' });

    const query = { schoolId };
    if (staffId) query.staff = staffId;

    const history = await StaffLeave.find(query)
      .populate('staff', 'employeeName designation')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve / Reject leave application
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, approvedBy } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leave = await StaffLeave.findByIdAndUpdate(
      id,
      {
        status,
        remarks,
        approvedBy: approvedBy || 'Admin',
        approvedOn: new Date().toLocaleDateString('en-GB'),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    res.json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  applyLeave,
  getPendingLeaves,
  getLeaveHistory,
  updateLeaveStatus
};