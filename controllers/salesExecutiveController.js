// controllers/salesExecutiveController.js

const SalesExecutive = require("../models/SalesExecutive");
const { sendWelcomeEmail } = require("../utils/sendEmail");

// Generate secure random password: Ms@ + 5 digits
const generatePassword = () => {
  const prefix = "Ms@";
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 10000 to 99999
  return `${prefix}${randomNum}`;
};

// @desc    Add new sales executive + Send Welcome Email
// @route   POST /api/sales-executives
// @access  Private (SuperAdmin)
const addSalesExecutive = async (req, res) => {
  try {
    const { name, mobile, code, email, username } = req.body;

    // Validation
    if (!name || !mobile || !code || !email || !username) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: Name, Mobile, Employee ID, Email, Username",
      });
    }

    // Trim & sanitize
    const trimmedCode = code.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();

    // Check for existing Employee ID or Email
    const existingExecutive = await SalesExecutive.findOne({
      $or: [{ code: trimmedCode }, { email: trimmedEmail }],
    });

    if (existingExecutive) {
      const errorMsg =
        existingExecutive.code === trimmedCode
          ? "Employee ID already exists!"
          : "Email already registered!";
      return res.status(400).json({ success: false, message: errorMsg });
    }

    // Generate password
    const password = generatePassword();

    // Create new executive
    const newExecutive = await SalesExecutive.create({
      code: trimmedCode,
      name: name.trim().toUpperCase(),
      mobile: mobile.trim(),
      email: trimmedEmail,
      username: trimmedUsername,
      password, // Will be visible only once (in email)
      isActive: true,
    });

    // Send Welcome Email (fire and forget — don't block response if email fails)
    sendWelcomeEmail(
      newExecutive.email,
      newExecutive.name,
      newExecutive.username,
      password
    ).catch((emailErr) => {
      console.error(`Welcome email failed for ${newExecutive.email}:`, emailErr.message);
      // Optional: Log to DB or admin alert
    });

    // Respond to frontend
    res.status(201).json({
      success: true,
      message: "Sales Executive added successfully! Login credentials sent to email.",
      data: {
        _id: newExecutive._id,
        code: newExecutive.code,
        name: newExecutive.name,
        mobile: newExecutive.mobile,
        email: newExecutive.email,
        username: newExecutive.username,
        password: password, // Show once in UI (optional)
        isActive: newExecutive.isActive,
        createdAt: newExecutive.createdAt,
      },
    });
  } catch (error) {
    console.error("Add Sales Executive Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all sales executives
// @route   GET /api/sales-executives
const getSalesExecutives = async (req, res) => {
  try {
    const executives = await SalesExecutive.find({})
      .select("-__v") // Hide internal fields
      .sort({ name: 1 });

    res.status(200).json(executives);
  } catch (error) {
    console.error("Get Executives Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch executives" });
  }
};

// @desc    Block / Deactivate executive
// @route   PUT /api/sales-executives/:id/block
const blockExecutive = async (req, res) => {
  try {
    const executive = await SalesExecutive.findById(req.params.id);
    if (!executive) {
      return res.status(404).json({ success: false, message: "Executive not found" });
    }

    if (!executive.isActive) {
      return res.status(400).json({ success: false, message: "Already blocked" });
    }

    executive.isActive = false;
    await executive.save();

    res.json({
      success: true,
      message: `${executive.name} has been blocked`,
    });
  } catch (error) {
    console.error("Block Executive Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Activate executive
// @route   PUT /api/sales-executives/:id/activate
const activateExecutive = async (req, res) => {
  try {
    const executive = await SalesExecutive.findById(req.params.id);
    if (!executive) {
      return res.status(404).json({ success: false, message: "Executive not found" });
    }

    if (executive.isActive) {
      return res.status(400).json({ success: false, message: "Already active" });
    }

    executive.isActive = true;
    await executive.save();

    res.json({
      success: true,
      message: `${executive.name} has been activated`,
    });
  } catch (error) {
    console.error("Activate Executive Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addSalesExecutive,
  getSalesExecutives,
  blockExecutive,
  activateExecutive,
};