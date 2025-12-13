// backend/controllers/complaintController.js
const Complaint = require('../models/Complaint');

// POST - Submit new complaint
const submitComplaint = async (req, res) => {
  try {
    const { name, email, phone, subject, description } = req.body;

    const complaint = new Complaint({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      description: description.trim(),
    });

    await complaint.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint: {
        id: complaint._id,
        subject: complaint.subject,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
    });
  } catch (err) {
    console.error('Complaint Submit Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: err.message,
    });
  }
};

// GET - All complaints (for admin panel later)
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .select('name email phone subject status createdAt');

    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitComplaint,
  getAllComplaints,
};