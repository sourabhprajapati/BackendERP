// controllers/bankDetailController.js
const Schoolinfo = require('../models/Schoolinfo');

const getBankDetails = async (req, res) => {
  try {
    const school = await Schoolinfo.findOne().select('bankDetails');

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    res.status(200).json({
      success: true,
      data: school.bankDetails || null
    });

  } catch (error) {
    console.error("Get Bank Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateBankDetails = async (req, res) => {
  try {
    const {
      bankName,
      accountHolderName,
      branchName,
      accountNumber,
      ifscCode
    } = req.body;

    // Validation
    if (!bankName || !accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: "All fields except Branch Name are required"
      });
    }

    // IFSC Code validation (Indian format)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.trim().toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC Code. Example: SBIN0001234"
      });
    }

    const school = await Schoolinfo.findOne();

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found. Register school first."
      });
    }

    // Update bank details
    school.bankDetails = {
      bankName: bankName.trim(),
      accountHolderName: accountHolderName.trim(),
      branchName: branchName?.trim() || "",
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      isDefault: true
    };

    await school.save();

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully!",
      data: school.bankDetails
    });

  } catch (error) {
    console.error("Update Bank Details Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry detected"
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

module.exports = { getBankDetails, updateBankDetails };