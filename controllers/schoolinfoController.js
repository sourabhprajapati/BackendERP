const Schoolinfo = require('../models/Schoolinfo');

const createSchoolinfo = async (req, res) => {
  try {
    const {
      schoolName, email, academicSession, website, decisionMaker,
      mobileNo, decisionMakerRole, strength, affiliationNumber,
      registrationNumber, pincode, state, district, addressLine1,
      addressLine2, otpForFeeDiscount, discountOtpMobile
    } = req.body;

    const required = { schoolName, email, mobileNo, academicSession, pincode, state, district };
    for (const [key, value] of Object.entries(required)) {
      if (!value || value.toString().trim() === '') {
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }

    const schoolLogo = req.files?.schoolLogo?.[0]?.path || null;
    const tcHeaderLogo = req.files?.tcHeaderLogo?.[0]?.path || null;

    const newSchoolinfo = new Schoolinfo({
      schoolName,
      email,
      academicSession,
      website: website || null,
      decisionMaker: decisionMaker || null,
      mobileNo,
      decisionMakerRole: decisionMakerRole || null,
      strength: strength ? Number(strength) : null,
      affiliationNumber: affiliationNumber || null,
      registrationNumber: registrationNumber || null,

      address: {
        pincode,
        state,
        district,
        line1: addressLine1 || null,
        line2: addressLine2 || null
      },

      schoolLogo,
      tcHeaderLogo,

      securitySettings: {
        otpForFeeDiscount: otpForFeeDiscount === 'true' || otpForFeeDiscount === true,
        discountOtpMobile: discountOtpMobile || null
      }
    });

    await newSchoolinfo.save();

    res.status(201).json({
      success: true,
      message: "School registered successfully!",
      data: newSchoolinfo
    });

  } catch (error) {
    console.error("Create Schoolinfo Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "This email is already registered" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSchoolinfo };