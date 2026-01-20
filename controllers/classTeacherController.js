// controllers/classTeacherController.js
const mongoose = require('mongoose');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const Staff = require('../models/Staff');

const assignClassTeacher = async (req, res) => {
  try {
    const { schoolId, className, teacherId } = req.body;

    // 1️⃣ Basic validation
    if (!schoolId || !className || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "schoolId, className, and teacherId are required"
      });
    }

    // 2️⃣ Verify teacher exists
    const teacher = await Staff.findOne({
      _id: teacherId,
      schoolId,
      userType: { $in: ["Teacher", "Staff"] }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found or does not belong to this school"
      });
    }

    // 3️⃣ ❌ Check if class already has a teacher
    const existingClass = await ClassTeacherAssignment.findOne({
      schoolId,
      className,
      isActive: true
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: `Class ${className} already has a class teacher`
      });
    }

    // 4️⃣ ❌ Check if teacher already assigned to another class
    const teacherAlreadyAssigned = await ClassTeacherAssignment.findOne({
      schoolId,
      teacherId,
      isActive: true
    });

    if (teacherAlreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "This teacher is already assigned to another class"
      });
    }

    // 5️⃣ ✅ Create assignment
    const assignment = new ClassTeacherAssignment({
      schoolId,
      className,
      teacherId,
      assignedBy: req.user?._id || null
    });

    await assignment.save();

    const populated = await ClassTeacherAssignment.findById(assignment._id)
      .populate("teacherId", "employeeName designation");

    res.status(201).json({
      success: true,
      message: "Class teacher assigned successfully",
      data: {
        _id: assignment._id.toString(),
        className: populated.className,
        teacher: populated.teacherId?.employeeName,
        designation: populated.teacherId?.designation
      }
    });

  } catch (error) {
    console.error("Assign class teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getAssignedClassTeachers = async (req, res) => {
  try {
    const schoolId = req.query.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required"
      });
    }

    const assignments = await ClassTeacherAssignment.find({
      schoolId,
      isActive: true
    })
      .populate('teacherId', 'employeeName designation')
      .sort({ className: 1 });

    // Format response with _id included
    const formattedAssignments = assignments.map((assignment) => ({
      _id: assignment._id.toString(),
      className: assignment.className,
      teacher: assignment.teacherId?.employeeName || 'N/A',
      teacherId: assignment.teacherId?._id?.toString(),
      designation: assignment.teacherId?.designation || 'N/A',
      assignedAt: assignment.assignedAt
    }));

    res.json({
      success: true,
      count: formattedAssignments.length,
      data: formattedAssignments
    });
  } catch (error) {
    console.error('Get assigned teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateClassTeacherAssignment = async (req, res) => {
  try {
    const { id } = req.params; // assignment _id from URL
    const { schoolId, className, teacherId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required in URL (/assign/:id)"
      });
    }

    if (!schoolId || !className || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "schoolId, className, and teacherId are required in body"
      });
    }

    // Update only the specific assignment that matches both _id and schoolId
    const assignment = await ClassTeacherAssignment.findOneAndUpdate(
      { 
        _id: id, 
        schoolId  // security check
      },
      {
        className,
        teacherId,
        assignedAt: new Date(), // update timestamp
        // assignedBy: req.user?._id || null, // optional
      },
      { 
        new: true,           // return updated document
        runValidators: true  // enforce schema validation
      }
    ).populate('teacherId', 'employeeName designation');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or you are not authorized for this school"
      });
    }

    res.json({
      success: true,
      message: "Class teacher assignment updated successfully",
      data: {
        _id: assignment._id.toString(),
        className: assignment.className,
        teacher: assignment.teacherId?.employeeName || 'N/A',
        designation: assignment.teacherId?.designation || 'N/A',
        teacherId: assignment.teacherId?._id?.toString()
      }
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// DELETE (Soft Unassign) Class Teacher
const deleteClassTeacherAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { schoolId } = req.query;

    if (!id || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID and schoolId are required"
      });
    }

    const assignment = await ClassTeacherAssignment.findOneAndUpdate(
      { _id: id, schoolId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or already removed"
      });
    }

    res.json({
      success: true,
      message: "Class teacher unassigned successfully"
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  assignClassTeacher,
  getAssignedClassTeachers,
  updateClassTeacherAssignment,
  deleteClassTeacherAssignment 
};