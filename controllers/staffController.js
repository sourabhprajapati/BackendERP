// controllers/staffController.js
const Staff = require('../models/Staff');
const uploadStaffFiles = require('../middleware/multer1'); // ← multer instance

const createStaff = async (req, res) => {
  uploadStaffFiles(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const files = req.files || {};

      // Get schoolId from form (since no JWT)
      const schoolId = req.body.schoolId?.trim();
      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'School ID is required. Please login again.'
        });
      }

      const staffData = {
        employeeName: req.body.employeeName?.trim(),
        employeeUserName: req.body.employeeUserName?.trim(),
        dob: req.body.dob,
        userType: req.body.userType,
        designation: req.body.designation?.trim(),
        mobile: req.body.mobile,
        email: req.body.email?.toLowerCase().trim(),
        gender: req.body.gender,
        address: req.body.address?.trim(),

        schoolId: schoolId,

        // Optional fields
        natureOfAppointment: req.body.natureOfAppointment,
        joiningDate: req.body.joiningDate,
        department: req.body.department,
        qualification: req.body.qualification,
        experienceYears: req.body.experienceYears,
        bloodGroup: req.body.bloodGroup,
        maritalStatus: req.body.maritalStatus,
        emergencyContact: req.body.emergencyContact,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        bankName: req.body.bankName,
        accountNumber: req.body.accountNumber,
        ifscCode: req.body.ifscCode,
        panNumber: req.body.panNumber,
        aadharNumber: req.body.aadharNumber,

        // Files
        profilePhoto: files.profilePhoto?.[0]?.filename,
        panCard: files.panCard?.[0]?.filename,
        dl: files.dl?.[0]?.filename,
        pgCert: files.pgCert?.[0]?.filename,
        policeVerification: files.policeVerification?.[0]?.filename,
        otherDoc: files.otherDoc?.[0]?.filename,
        aadharCard: files.aadharCard?.[0]?.filename,
        voterId: files.voterId?.[0]?.filename,
        ugCert: files.ugCert?.[0]?.filename,
        bedCert: files.bedCert?.[0]?.filename,
        experienceCert: files.experienceCert?.[0]?.filename,
      };

      const staff = new Staff(staffData);
      await staff.save();

      res.status(201).json({
        success: true,
        message: 'Staff registered successfully!',
        data: staff
      });

    } catch (error) {
      console.error('Staff Create Error:', error);
      if (error.code === 11000) {
        const field = error.message.includes('employeeUserName') ? 'Username' : 'Email';
        return res.status(400).json({ success: false, message: `${field} already exists` });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ schoolId: req.body.schoolId || req.query.schoolId });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createStaff, getStaff };