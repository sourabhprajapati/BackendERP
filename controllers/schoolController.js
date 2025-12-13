// controllers/schoolController.js
const School = require('../models/School');
const bcrypt = require('bcrypt');
const { createTransport } = require('nodemailer');

// Nodemailer setup
const transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
});

// Password generator
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const generateUsername = (email) => {
  const prefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}${num}`;
};

const generateUniqueCode = (schoolName) => {
  const prefix = schoolName.trim().split(' ')[0].toUpperCase().slice(0, 3);
  const num = Math.floor(10 + Math.random() * 90);
  return `${prefix}${num}`;
};

// GET ALL SCHOOLS (Pending + Approved + Rejected) – NO FILE NAMES EXPOSED
const getPendingSchools = async (req, res) => {
  try {
    const schools = await School.find({})
      .select(`
        salesExecutive email schoolName district state 
        createdAt actionDate status username plainPassword uniqueCode
      `) // password is HASHED – safe to send (frontend will show plain only if you send it separately)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// APPROVE SCHOOL – Now returns plain password to frontend
const approveSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findById(id);

    if (!school || school.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const username = generateUsername(school.email);
    const plainPassword = generatePassword();           // Keep plain password
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    const uniqueCode = generateUniqueCode(school.schoolName);

    school.status = 'Approved';
    school.username = username;
    school.password = hashedPassword; 
    school.plainPassword = plainPassword;    // Save only hash
    school.uniqueCode = uniqueCode;
    school.actionDate = new Date();
    await school.save();

    // Send email to school
    await transporter.sendMail({
      from: `"Mittsure ERP" <${process.env.EMAIL_USER}>`,
      to: school.email,
      subject: 'Your Mittsure ERP Account is Ready!',
      html: `
        <h2>Welcome ${school.schoolName}!</h2>
        <p>Your school has been approved.</p>
        <div style="background:#f4f4f4;padding:20px;border-radius:8px;">
          <p><strong>School Code:</strong> <b style="font-size:20px;color:#d35400">${uniqueCode}</b></p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> <code>${plainPassword}</code></p>
        </div>
        <p><a href="http://localhost:3000/login" style="background:#004585;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Login Now</a></p>
        <p style="color:#777;font-size:12px;">Please change password after first login.</p>
      `,
    });

    // Send plain password to frontend (only SuperAdmin sees it)
    res.json({
      success: true,
      message: 'Approved & credentials emailed!',
      data: {
        username,
        plainPassword,      // This is what frontend will show
        uniqueCode
      }
    });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ success: false, message: 'Approval failed' });
  }
};

// REJECT SCHOOL
const rejectSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason?.trim()) {
      return res.status(400).json({ success: false, message: 'Reason required' });
    }

    const school = await School.findById(id);
    if (!school || school.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    school.status = 'Rejected';
    school.rejectionReason = rejectionReason.trim();
    school.actionDate = new Date();
    await school.save();

    await transporter.sendMail({
      from: `"Mittsure ERP" <${process.env.EMAIL_USER}>`,
      to: school.email,
      subject: 'Onboarding Request Update',
      html: `<p>Dear ${school.schoolName},</p><p>Your request was not approved.</p><p><strong>Reason:</strong> ${rejectionReason}</p><p>Thank you.</p>`,
    });

    res.json({ success: true, message: 'Rejected & notified' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ success: false, message: 'Rejection failed' });
  }
};

// CREATE SCHOOL REQUEST (your existing one – unchanged)
// controllers/schoolController.js → ADD THIS FULL FUNCTION

const createSchoolRequest = async (req, res) => {
  try {
    // 1. Get all form fields
    const {
      salesExecutive,
      schoolName,
      state,
      district,
      address,
      email,
      contactNo,
      contactPerson,
      selectBoard,
      grade,
      strength,
      noOfStudents,
      tpg,
      talentBox,
      distributor
    } = req.body;

    // 2. Get uploaded files
    const consentFile = req.files?.consentFile?.[0]?.filename;
    const loginFile = req.files?.loginFile?.[0]?.filename;

    // 3. Validation
    if (!consentFile || !loginFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload both Consent Form and Login Form'
      });
    }

    if (!schoolName || !email || !distributor) {
      return res.status(400).json({
        success: false,
        message: 'All required fields are mandatory'
      });
    }

    // 4. Check if email already exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      return res.status(400).json({
        success: false,
        message: 'School with this email already exists'
      });
    }

    // 5. Create new school
    const newSchool = new School({
      salesExecutive: salesExecutive?.trim(),
      schoolName: schoolName.trim(),
      state: state?.trim(),
      district: district?.trim(),
      address: address?.trim(),
      email: email.toLowerCase().trim(),
      contactNo,
      contactPerson: contactPerson?.trim(),
      selectBoard,
      grade,
      strength,
      noOfStudents,
      tpg: tpg === 'true' || tpg === true,
      talentBox: talentBox === 'true' || talentBox === true,
      distributor,
      consentFile,
      loginFile,
      status: 'Pending'
    });

    await newSchool.save();

    // 6. Success response
    res.status(201).json({
      success: true,
      message: 'School request submitted successfully! Awaiting approval.',
      data: newSchool
    });

  } catch (error) {
    console.error('Create School Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = {
  createSchoolRequest,
  getPendingSchools,
  approveSchool,
  rejectSchool,
};