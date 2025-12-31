// controllers/classTeacherController.js
const mongoose = require('mongoose');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const Staff = require('../models/Staff');

const assignClassTeacher = async (req, res) => {
  try {
    const { schoolId, className, teacherId } = req.body;

    if (!schoolId || !className || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'schoolId, className, and teacherId are required'
      });
    }

    // Verify teacher exists and belongs to the school
    const teacher = await Staff.findOne({
      _id: teacherId,
      schoolId,
      userType: { $in: ['Teacher', 'Staff'] }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found or does not belong to this school'
      });
    }

    // Check if class already has a teacher
    const existing = await ClassTeacherAssignment.findOne({
      schoolId,
      className,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Class ${className} is already assigned to another teacher`
      });
    }

    const assignment = new ClassTeacherAssignment({
      schoolId,
      className,
      teacherId,
      assignedBy: req.user?._id || null, // optional - if you have auth
    });

    await assignment.save();

    // Populate teacher info for response
    const populated = await ClassTeacherAssignment.findById(assignment._id)
      .populate('teacherId', 'employeeName designation');

    res.status(201).json({
      success: true,
      message: 'Class teacher assigned successfully',
      data: {
        _id: assignment._id.toString(),
        className: populated.className,
        teacher: populated.teacherId?.employeeName || 'N/A',
        designation: populated.teacherId?.designation || 'N/A',
        assignedAt: populated.assignedAt
      }
    });
  } catch (error) {
    console.error('Assign class teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

module.exports = {
  assignClassTeacher,
  getAssignedClassTeachers,
  updateClassTeacherAssignment
};