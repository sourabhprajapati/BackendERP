const PromotionHistory = require('../models/PromotionHistory');

exports.promoteStudents = async (req, res) => {
  try {
    const { studentIds, fromClass, fromSection, toClass, toSection, fromSession, toSession } = req.body;

    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds array is required' });
    }
    if (!fromClass || !fromSection || !toClass || !toSection || !fromSession || !toSession) {
      return res.status(400).json({ message: 'All class, section, and session fields are required' });
    }

    // Check if students exist and are in the correct class/section/session
    const students = await Student.find({
      _id: { $in: studentIds },
      className: fromClass,
      section: fromSection,
      session: fromSession,
      isActive: true
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'Some students not found or not eligible for promotion' });
    }

    // Check for duplicate promotion (already in target class/session)
    const existingInTarget = await Student.find({
      _id: { $in: studentIds },
      className: toClass,
      section: toSection,
      session: toSession
    });

    if (existingInTarget.length > 0) {
      return res.status(400).json({ message: 'Some students are already in the target class/section/session' });
    }

    // Update students
    const updateResult = await Student.updateMany(
      { _id: { $in: studentIds } },
      {
        $set: {
          className: toClass,
          section: toSection,
          session: toSession
        }
      }
    );

    // Create promotion history records
    const promotionRecords = students.map(student => ({
      studentId: student._id,
      fromClass,
      toClass,
      fromSection,
      toSection,
      fromSession,
      toSession,
      promotedAt: new Date(),
      promotedBy: req.user?.id // optional admin ID
    }));

    await PromotionHistory.insertMany(promotionRecords);

    res.json({
      success: true,
      promotedCount: updateResult.modifiedCount,
      message: 'Students promoted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error promoting students', error: error.message });
  }
};
const StudentDetail = require('../models/StudentDetail');


exports.promoteStudents = async (req, res) => {
  try {
    const { studentIds, fromClass, fromSection, toClass, toSection, fromSession, toSession } = req.body;

    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds array is required' });
    }
    if (!fromClass || !fromSection || !toClass || !toSection || !fromSession || !toSession) {
      return res.status(400).json({ message: 'All class, section, and session fields are required' });
    }

    // Check if students exist and are in the correct class/section/session
    const students = await StudentDetail.find({
      _id: { $in: studentIds },
      'basic.class': fromClass,
      'basic.section': fromSection,
      status: 'active'
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'Some students not found or not eligible for promotion' });
    }

    // Check for duplicate promotion (already in target class/session)
    const existingInTarget = await StudentDetail.find({
      _id: { $in: studentIds },
      'basic.class': toClass,
      'basic.section': toSection
    });

    if (existingInTarget.length > 0) {
      return res.status(400).json({ message: 'Some students are already in the target class/section/session' });
    }

    // Update students
    const updateResult = await StudentDetail.updateMany(
      { _id: { $in: studentIds } },
      {
        $set: {
          'basic.class': toClass,
          'basic.section': toSection
        }
      }
    );

    // Create promotion history records
    const promotionRecords = students.map(student => ({
      studentId: student._id,
      fromClass,
      toClass,
      fromSection,
      toSection,
      fromSession,
      toSession,
      promotedAt: new Date(),
      promotedBy: req.user?.id // optional admin ID
    }));

    await PromotionHistory.insertMany(promotionRecords);

    res.json({
      success: true,
      promotedCount: updateResult.modifiedCount,
      message: 'Students promoted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error promoting students', error: error.message });
  }
};
