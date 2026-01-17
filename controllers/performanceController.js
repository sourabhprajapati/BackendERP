const Performance = require('../models/Performance');
const StudentDetail = require('../models/StudentDetail');

// Get students for performance entry by class and section
const getStudentsForPerformance = async (req, res) => {
  try {
    const { className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({ message: 'Class and section are required' });
    }

    const students = await StudentDetail.find({
      'basic.class': className,
      'basic.section': section,
      status: 'active'
    }).select('basic.admissionNo basic.rollNo basic.name basic.firstName basic.lastName _id');

    const formattedStudents = students.map(student => ({
      id: student._id,
      adm: student.basic.admissionNo,
      roll: student.basic.rollNo,
      name: student.basic.name || `${student.basic.firstName} ${student.basic.lastName || ''}`.trim(),
      className: student.basic.class,
      section: student.basic.section
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students for performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save performance marks for students
const savePerformanceMarks = async (req, res) => {
  try {
    const { class: className, section, examName, subjectArea, subject, records } = req.body;

    if (!className || !section || !examName || !subjectArea || !subject || !Array.isArray(records)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const formattedRecords = records.map(r => ({
      studentId: r.studentId,
      admissionNo: r.admissionNo || r.adm,
      rollNo: r.rollNo || r.roll,
      studentName: r.studentName || r.name,
      marks: r.marks ? parseFloat(r.marks) : null,
      status: r.status || 'MARKS',
      grade: r.grade || '',
      remarks: r.remarks || ''
    }));

    const performance = await Performance.findOneAndUpdate(
      {
        class: className,
        section,
        examName,
        subjectArea,
        subject
      },
      {
        class: className,
        section,
        examName,
        subjectArea,
        subject,
        records: formattedRecords,
        totalStudents: formattedRecords.length,
        markedBy: req.user?.name || 'System'
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    res.json({ message: 'Performance marks saved successfully', performance });
  } catch (error) {
    console.error("PERFORMANCE SAVE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get performance records for editing
const getPerformanceRecords = async (req, res) => {
  try {
    const { class: className, section, examName, subjectArea } = req.query;

    if (!className || !section || !examName || !subjectArea) {
      return res.status(400).json({ message: 'Class, section, exam name, and subject area are required' });
    }

    const performance = await Performance.findOne({
      class: className,
      section,
      examName,
      subjectArea
    });

    if (!performance) {
      return res.json({ records: [] });
    }

    res.json({
      records: performance.records.map(record => ({
        studentId: record.studentId,
        admissionNo: record.admissionNo,
        rollNo: record.rollNo,
        studentName: record.studentName,
        marks: record.marks,
        status: record.status,
        grade: record.grade,
        remarks: record.remarks
      }))
    });
  } catch (error) {
    console.error('Error fetching performance records:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all performance exams for a class/section
const getPerformanceExams = async (req, res) => {
  try {
    const { class: className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({ message: 'Class and section are required' });
    }

    const performances = await Performance.find({
      class: className,
      section
    }).select('examName subjectArea academicYear isPublished createdAt');

    res.json(performances);
  } catch (error) {
    console.error('Error fetching performance exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student performance summary
const getStudentPerformanceSummary = async (req, res) => {
  try {
    const { admissionNo } = req.params;

    if (!admissionNo) {
      return res.status(400).json({ message: 'Admission number is required' });
    }

    const performances = await Performance.find({
      'records.admissionNo': admissionNo,
      isPublished: true
    }).select('examName subjectArea records.$ academicYear');

    const summary = performances.map(perf => {
      const studentRecord = perf.records[0];
      return {
        examName: perf.examName,
        subjectArea: perf.subjectArea,
        academicYear: perf.academicYear,
        marks: studentRecord.marks,
        status: studentRecord.status,
        grade: studentRecord.grade,
        remarks: studentRecord.remarks
      };
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching student performance summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle publish status of performance results
const togglePublishResults = async (req, res) => {
  try {
    const { class: className, section, examName, subjectArea, isPublished } = req.body;

    if (!className || !section || !examName || !subjectArea) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updateData = { isPublished };
    if (isPublished) {
      updateData.publishedAt = new Date();
    }

    const performance = await Performance.findOneAndUpdate(
      { class: className, section, examName, subjectArea },
      updateData,
      { new: true }
    );

    if (!performance) {
      return res.status(404).json({ message: 'Performance record not found' });
    }

    res.json({
      message: `Results ${isPublished ? 'published' : 'unpublished'} successfully`,
      performance
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudentsForPerformance,
  savePerformanceMarks,
  getPerformanceRecords,
  getPerformanceExams,
  getStudentPerformanceSummary,
  togglePublishResults
};
