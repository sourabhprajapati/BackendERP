// controllers/staffController.js
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs'); // ← IMPORT bcrypt here
const uploadStaffFiles = require('../middleware/multer1');

const createStaff = async (req, res) => {
  uploadStaffFiles(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const files = req.files || {};

      const schoolId = req.body.schoolId?.trim();
      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'School ID is required.'
        });
      }

      let teachingClass = req.body.teachingClass;
      if (typeof teachingClass === 'string') teachingClass = [teachingClass];
      if (!Array.isArray(teachingClass)) teachingClass = [];

      const staffData = {
        employeeName: req.body.employeeName?.trim(),
        employeeUserName: req.body.employeeUserName?.trim(),
        password: req.body.password || undefined, // only if provided
        fatherName: req.body.fatherName?.trim(),
        dob: req.body.dob,
        gender: req.body.gender,
        maritalStatus: req.body.maritalStatus,
        userType: req.body.userType,
        designation: req.body.designation?.trim(),
        department: req.body.department,
        kindOfTeacher: req.body.kindOfTeacher,
        natureOfAppointment: req.body.natureOfAppointment,
        teachingClass,
        qualification: req.body.qualification,
        joiningDate: req.body.joiningDate,
        leavingDate: req.body.leavingDate,
        mobile: req.body.mobile?.trim() || req.body.mobile1?.trim(),
        mobile2: req.body.mobile2?.trim(),
        email: req.body.email?.toLowerCase().trim(),
        address: req.body.address?.trim(),
        otherComments: req.body.otherComments?.trim(),
        schoolId,
        // Files (if any new uploaded)
        profilePhoto: files.profilePhoto?.[0]?.filename || undefined,
        panCard: files.panCard?.[0]?.filename || undefined,
        // ... add others if needed
      };

      // Remove undefined fields
      Object.keys(staffData).forEach(key => staffData[key] === undefined && delete staffData[key]);

      const staff = new Staff(staffData);
      await staff.save();

      res.status(201).json({
        success: true,
        message: 'Staff created successfully',
        data: staff
      });
    } catch (error) {
      console.error('Create Staff Error:', error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          message: `${field === 'employeeUserName' ? 'Username' : 'Email'} already exists`
        });
      }
      res.status(500).json({ success: false, message: 'Server error during creation' });
    }
  });
};

const getStaff = async (req, res) => {
  try {
    const schoolId = req.query.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID is required" });
    }

    const staff = await Staff.find({ schoolId })
      .select('-password') // Never send password
      .lean();

    res.status(200).json({
      success: true,
      data: staff,
      count: staff.length
    });
  } catch (error) {
    console.error('Get Staff Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching staff' });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No data provided to update' 
      });
    }

    // CRITICAL FIX: Get schoolId from frontend body (recommended)
    const schoolId = updates.schoolId || req.body.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required for update'
      });
    }

    // Remove schoolId from updates so it doesn't get saved in staff document
    delete updates.schoolId;

    // Handle teachingClass array
    if (updates.teachingClass) {
      if (typeof updates.teachingClass === 'string') {
        updates.teachingClass = [updates.teachingClass];
      } else if (!Array.isArray(updates.teachingClass)) {
        updates.teachingClass = [];
      }
    }

    // Hash password only if provided and not empty
    if (updates.password && updates.password.trim() !== '') {
      updates.password = await bcrypt.hash(updates.password.trim(), 12);
    } else {
      delete updates.password; // Don't overwrite with empty string
    }

    // Prevent updating _id or other system fields
    delete updates._id;
    delete updates.createdAt;

   const staff = await Staff.findOneAndUpdate(
  { _id: id, schoolId },
  { $set: updates },
  { new: true, runValidators: false }
);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or you are not authorized to update'
      });
    }

    // Hide password in response
    staff.password = undefined;

    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: staff
    });

  } catch (error) {
    console.error('Update Staff Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during update',
      error: error.message
    });
  }
};
// Mark staff as Inactive
const inactiveStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required"
      });
    }

    const staff = await Staff.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status: "Inactive" } },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found or unauthorized"
      });
    }

    res.json({
      success: true,
      message: "Staff marked as Inactive successfully",
      data: staff
    });

  } catch (error) {
    console.error("Inactive Staff Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while inactivating staff"
    });
  }
};

module.exports = { createStaff, getStaff, updateStaff, inactiveStaff };