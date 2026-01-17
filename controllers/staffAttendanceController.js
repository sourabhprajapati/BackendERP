// controllers/staffAttendanceController.js
const Staff = require('../models/Staff');
const StaffAttendance = require('../models/StaffAttendance');

const markStaffAttendance = async (req, res) => {
  try {
    const { schoolId, date, records } = req.body;

    if (!schoolId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'schoolId, date and records array are required'
      });
    }

    // Validate date format (DD-MM-YYYY)
    if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use DD-MM-YYYY'
      });
    }

    const attendanceRecords = [];

    for (const record of records) {
      const { staffId, attendance, remarks = '' } = record;

      if (!staffId || !attendance) {
        continue; // skip invalid records
      }

      // Verify staff belongs to this school
      const staff = await Staff.findOne({
        _id: staffId,
        schoolId: schoolId
      });

      if (!staff) {
        continue; // skip if staff not found or not authorized
      }

      // Upsert (update if exists, create if not)
      const updatedAttendance = await StaffAttendance.findOneAndUpdate(
        { staff: staffId, date },
        {
          staff: staffId,
          schoolId,
          date,
          attendance,
          remarks,
          updatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true, 
          setDefaultsOnInsert: true 
        }
      );

      attendanceRecords.push(updatedAttendance);
    }

    res.status(200).json({
      success: true,
      message: 'Staff attendance saved successfully',
      count: attendanceRecords.length,
      date
    });

  } catch (error) {
    console.error('Staff Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving staff attendance',
      error: error.message
    });
  }
};

// Get attendance for a particular date (for one school)
const getStaffAttendanceByDate = async (req, res) => {
  try {
    const { schoolId, date } = req.query;

    if (!schoolId || !date) {
      return res.status(400).json({
        success: false,
        message: 'schoolId and date are required'
      });
    }

    const attendances = await StaffAttendance.find({ schoolId, date })
      .populate('staff', 'employeeName employeeUserName designation department')
      .lean();

    res.status(200).json({
      success: true,
      date,
      count: attendances.length,
      data: attendances
    });

  } catch (error) {
    console.error('Get Staff Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff attendance'
    });
  }
};

// Optional: Get all attendance of one staff member (for history/report)
const getStaffAttendanceHistory = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { schoolId, fromDate, toDate } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'schoolId is required'
      });
    }

    const query = {
      staff: staffId,
      schoolId
    };

    if (fromDate) query.date = { $gte: fromDate };
    if (toDate) {
      if (query.date) query.date.$lte = toDate;
      else query.date = { $lte: toDate };
    }

    const history = await StaffAttendance.find(query)
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      staffId,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error('Staff Attendance History Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  markStaffAttendance,
  getStaffAttendanceByDate,
  getStaffAttendanceHistory
};