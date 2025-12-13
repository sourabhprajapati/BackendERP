// backend/controllers/admissionController.js
const AdmissionEnquiry = require('../models/AdmissionEnquiry');

const submitEnquiry = async (req, res) => {
  try {
    const {
      visitingDate, session, admissionClass, studentName, address,
      source, remark, fatherName, motherName, gender, dob,
      fatherMobile, motherMobile, email
    } = req.body;

    const enquiry = new AdmissionEnquiry({
      visitingDate,
      session,
      admissionClass,
      studentName,
      address: address?.trim(),
      source: source || 'Other',
      remark: remark?.trim(),
      fatherName,
      motherName: motherName?.trim(),
      gender,
      dob,
      fatherMobile,
      motherMobile: motherMobile?.trim(),
      email: email?.trim(),
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Admission enquiry submitted successfully!',
      enquiry: {
        id: enquiry._id,
        studentName: enquiry.studentName,
        fatherName: enquiry.fatherName,
        fatherMobile: enquiry.fatherMobile,
        createdAt: enquiry.createdAt
      }
    });
  } catch (err) {
    console.error('Admission Enquiry Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: err.message
    });
  }
};

const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await AdmissionEnquiry.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(enquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitEnquiry, getAllEnquiries };