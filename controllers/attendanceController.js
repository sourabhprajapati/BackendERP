const Attendance = require('../models/Attendance');
const StudentDetail = require('../models/StudentDetail');

// Helper: Convert any input to UTC midnight Date (recommended for consistency)
const toUTCMidnight = (input) => {
  const d = new Date(input);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

// Helper: Convert any input to local midnight (only used for display if needed)
const toLocalMidnight = (input) => {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper: Get YYYY-MM-DD string in UTC (safe for keys if needed, but we avoid string keys)
const toUTCDateKey = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate()
  ).padStart(2, '0')}`;
};

// ---------------------------------------------------
// Get students for a specific class and section
// ---------------------------------------------------
const getStudentsForAttendance = async (req, res) => {
  try {
    const { className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({ message: 'Class and section are required' });
    }

    const students = await StudentDetail.find({
      'basic.class': className,
      'basic.section': section
    }).select('basic.admissionNo basic.rollNo basic.name basic.firstName basic.lastName _id');

    const formattedStudents = students.map((student) => ({
      id: student._id,
      adm: student.basic.admissionNo,
      roll: student.basic.rollNo,
      name:
        student.basic.name ||
        `${student.basic.firstName} ${student.basic.lastName || ''}`.trim(),
      className: student.basic.class,
      section: student.basic.section
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students for attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Save attendance records
// ---------------------------------------------------
const saveAttendance = async (req, res) => {
  try {
    const { class: cls, className, section, date, records } = req.body;

    const finalClassName = className || cls;
    if (!finalClassName || !section || !date || !Array.isArray(records)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedDate = toUTCMidnight(date); // Store as UTC midnight

    const formattedRecords = records
      .map((r) => ({
        studentId: r.studentId,
        admissionNo: r.admission || r.adm,
        rollNo: r.roll,
        name: r.name,
        status: r.attendance || r.status,
        inTime: r.inTime || '',
        outTime: r.outTime || '',
        note: r.note || ''
      }))
      .filter((r) => r.status && r.status !== 'Not Marked');

    await Attendance.findOneAndUpdate(
      {
        date: normalizedDate,
        className: finalClassName,
        section
      },
      {
        date: normalizedDate,
        className: finalClassName,
        section,
        records: formattedRecords,
        markedBy: req.user?.name || 'System'
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('ATTENDANCE SAVE ERROR 👉', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------
// Get attendance records for a specific date/class/section
// ---------------------------------------------------
const getAttendanceRecords = async (req, res) => {
  try {
    const { className, section, date } = req.query;

    if (!className || !section || !date) {
      return res.status(400).json({ message: 'Class, section, and date are required' });
    }

    const normalizedDate = toUTCMidnight(date);

    const attendance = await Attendance.findOne({
      date: normalizedDate,
      className,
      section
    }).populate('records.studentId', 'basic.name basic.admissionNo basic.rollNo');

    if (!attendance) {
      return res.json({ records: [] });
    }

    res.json({
      records: attendance.records.map((record) => ({
        admission: record.admissionNo,
        roll: record.rollNo,
        name: record.name,
        attendance: record.status,
        note: record.note
      }))
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Get attendance summary for a student (dashboard)
// ---------------------------------------------------
const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { admissionNo } = req.params;

    if (!admissionNo) {
      return res.status(400).json({ message: 'Admission number is required' });
    }

    const attendanceRecords = await Attendance.find({
      'records.admissionNo': admissionNo
    }).select('date records.$');

    let totalDays = 0;
    let presentDays = 0;

    attendanceRecords.forEach((attendance) => {
      const studentRecord = attendance.records.find((r) => r.admissionNo === admissionNo);
      if (studentRecord && studentRecord.status !== 'Holiday') {
        totalDays++;
        if (studentRecord.status === 'Present') presentDays++;
      }
    });

    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({ total: totalDays, present: presentDays, percentage });
  } catch (error) {
    console.error('Error fetching student attendance summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Mark holiday for a date range
// ---------------------------------------------------
const markHolidayRange = async (req, res) => {
  try {
    const { className, section, fromDate, toDate } = req.body;

    if (!className || !section || !fromDate || !toDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const from = toUTCMidnight(fromDate);
    const to = toUTCMidnight(toDate);

    const students = await StudentDetail.find({
      'basic.class': className,
      'basic.section': section,
      status: 'active'
    }).select('basic.admissionNo basic.rollNo basic.name basic.firstName basic.lastName _id');

    const records = students.map((student) => ({
      studentId: student._id,
      admissionNo: student.basic.admissionNo,
      rollNo: student.basic.rollNo,
      name:
        student.basic.name ||
        `${student.basic.firstName} ${student.basic.lastName || ''}`.trim(),
      status: 'Holiday',
      note: 'Official Holiday'
    }));

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const day = toUTCMidnight(d);

      await Attendance.findOneAndUpdate(
        { date: day, className, section },
        {
          date: day,
          className,
          section,
          records,
          totalStudents: students.length,
          markedBy: req.user?.name || 'System'
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Holiday marked successfully for the date range' });
  } catch (error) {
    console.error('Error marking holiday range:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Get detailed attendance for student
// ---------------------------------------------------
const getStudentAttendanceDetails = async (req, res) => {
  try {
    const { admissionNo } = req.params;

    const attendanceRecords = await Attendance.find({
      'records.admissionNo': admissionNo
    })
      .select('date records.$')
      .sort({ date: -1 });

    let total = 0,
      present = 0,
      absent = 0,
      leaves = 0,
      holidays = 0,
      currentStreak = 0,
      maxStreak = 0;

    attendanceRecords.forEach((attendance) => {
      const record = attendance.records.find((r) => r.admissionNo === admissionNo);
      if (!record) return;

      if (record.status === 'Holiday') {
        holidays++;
        return;
      }

      total++;
      if (record.status === 'Present') {
        present++;
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 0;
      }
      if (record.status === 'Absent') absent++;
      if (record.status === 'Leave') leaves++;
    });

    maxStreak = Math.max(maxStreak, currentStreak);

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      present,
      absent,
      leaves,
      holidays,
      total,
      percentage,
      streak: maxStreak
    });
  } catch (error) {
    console.error('Error fetching student attendance details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Get recent attendance records
// ---------------------------------------------------
const getStudentRecentAttendance = async (req, res) => {
  try {
    const { admissionNo } = req.params;
    const { limit = 10 } = req.query;

    const attendanceRecords = await Attendance.find({
      'records.admissionNo': admissionNo
    })
      .select('date records.$')
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    const recentRecords = attendanceRecords
      .map((attendance) => {
        const record = attendance.records.find((r) => r.admissionNo === admissionNo);
        if (!record) return null;

        const date = new Date(attendance.date);
        const formattedDate = `${date.getUTCDate().toString().padStart(2, '0')} ${date.toLocaleString(
          'default',
          { month: 'short', timeZone: 'UTC' }
        )} ${date.getUTCFullYear()}`;

        return {
          date: formattedDate,
          status: record.status,
          in: record.inTime || '--',
          out: record.outTime || '--',
          remark: record.note || ''
        };
      })
      .filter(Boolean);

    res.json(recentRecords);
  } catch (error) {
    console.error('Error fetching recent attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Get attendance calendar for a month (CRITICAL FIX APPLIED)
// ---------------------------------------------------
const getStudentAttendanceCalendar = async (req, res) => {
  try {
    const { admissionNo } = req.params;
    const { year, month } = req.query;

    if (!admissionNo || year === undefined || month === undefined) {
      return res.status(400).json({ message: 'Admission number, year, and month are required' });
    }

    const yearInt = Number(year);
    const monthInt = Number(month) - 1;   // << FIX


    const startDate = new Date(Date.UTC(yearInt, monthInt, 1));
    const endDate = new Date(Date.UTC(yearInt, monthInt + 1, 0, 23, 59, 59, 999));


    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      'records.admissionNo': admissionNo
    }).select('date records');

    const calendarData = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDay = toUTCMidnight(d);

      const attendance = attendanceRecords.find((rec) => {
        // Safe timestamp comparison — eliminates timezone shift issues
        return rec.date.getTime() === currentDay.getTime();
      });

      let status = 'Pending';

      if (attendance) {
        const studentRecord = attendance.records.find((r) => r.admissionNo === admissionNo);
        if (studentRecord) status = studentRecord.status;
      }

      // Return date in YYYY-MM-DD format (based on UTC to match frontend display)
      const dateKey = `${currentDay.getUTCFullYear()}-${String(
        currentDay.getUTCMonth() + 1
      ).padStart(2, '0')}-${String(currentDay.getUTCDate()).padStart(2, '0')}`;

      calendarData.push({
        date: dateKey,
        status
      });
    }

    res.json(calendarData);
  } catch (error) {
    console.error('Error fetching student attendance calendar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Download attendance report for a student (CSV)
// ---------------------------------------------------
const downloadAttendanceReport = async (req, res) => {
  try {
    const { admissionNo } = req.params;

    if (!admissionNo) {
      return res.status(400).json({ message: 'Admission number is required' });
    }

    const attendanceRecords = await Attendance.find({
      'records.admissionNo': admissionNo
    })
      .select('date records.$')
      .sort({ date: 1 });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    // Prepare CSV data
    const csvRows = ['Date,Status,In Time,Out Time,Remarks'];

    attendanceRecords.forEach((attendance) => {
      const record = attendance.records.find((r) => r.admissionNo === admissionNo);
      if (record) {
        const date = new Date(attendance.date);
        const formattedDate = `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
        const status = record.status;
        const inTime = record.inTime || '';
        const outTime = record.outTime || '';
        const remark = record.note || '';

        csvRows.push(`${formattedDate},${status},${inTime},${outTime},${remark}`);
      }
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_report_${admissionNo}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error downloading attendance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// General Attendance Report - Overall summary
// ---------------------------------------------------
const getGeneralAttendanceReport = async (req, res) => {
  try {
    const { fromDate, toDate, className, section } = req.query;

    let matchConditions = {};

    if (fromDate && toDate) {
      matchConditions.date = {
        $gte: toUTCMidnight(fromDate),
        $lte: toUTCMidnight(toDate)
      };
    }

    if (className) matchConditions.className = className;
    if (section) matchConditions.section = section;

    const attendanceRecords = await Attendance.find(matchConditions).select('date className section records');

    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalHoliday = 0;

    const classWiseData = {};

    attendanceRecords.forEach((attendance) => {
      const key = `${attendance.className}-${attendance.section}`;
      if (!classWiseData[key]) {
        classWiseData[key] = {
          className: attendance.className,
          section: attendance.section,
          totalStudents: 0,
          present: 0,
          absent: 0,
          leave: 0,
          holiday: 0,
          percentage: 0
        };
      }

      attendance.records.forEach((record) => {
        if (record.status !== 'Not Marked') {
          classWiseData[key].totalStudents++;
          totalStudents++;

          if (record.status === 'Present') {
            classWiseData[key].present++;
            totalPresent++;
          } else if (record.status === 'Absent') {
            classWiseData[key].absent++;
            totalAbsent++;
          } else if (record.status === 'Leave') {
            classWiseData[key].leave++;
            totalLeave++;
          } else if (record.status === 'Holiday') {
            classWiseData[key].holiday++;
            totalHoliday++;
          }
        }
      });
    });

    Object.keys(classWiseData).forEach((key) => {
      const data = classWiseData[key];
      data.percentage = data.totalStudents > 0 ? Math.round((data.present / data.totalStudents) * 100) : 0;
    });

    const overallPercentage = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

    res.json({
      overall: {
        totalStudents,
        present: totalPresent,
        absent: totalAbsent,
        leave: totalLeave,
        holiday: totalHoliday,
        percentage: overallPercentage
      },
      classWise: Object.values(classWiseData)
    });
  } catch (error) {
    console.error('Error fetching general attendance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Class Wise Attendance Report
// ---------------------------------------------------
const getClassWiseAttendanceReport = async (req, res) => {
  try {
    const { className, section, fromDate, toDate } = req.query;

    if (!className) {
      return res.json([]);
    }

    let matchConditions = { className };

    if (section) matchConditions.section = section;

    if (fromDate && toDate) {
      matchConditions.date = {
        $gte: toUTCMidnight(fromDate),
        $lte: toUTCMidnight(toDate)
      };
    }

    const attendanceRecords = await Attendance.find(matchConditions).select('date section records');

    const sectionWiseData = {};

    attendanceRecords.forEach((attendance) => {
      const key = attendance.section;
      if (!sectionWiseData[key]) {
        sectionWiseData[key] = {
          section: key,
          totalDays: 0,
          present: 0,
          absent: 0,
          leave: 0,
          holiday: 0,
          percentage: 0
        };
      }

      sectionWiseData[key].totalDays++;

      attendance.records.forEach((record) => {
        if (record.status === 'Present') sectionWiseData[key].present++;
        else if (record.status === 'Absent') sectionWiseData[key].absent++;
        else if (record.status === 'Leave') sectionWiseData[key].leave++;
        else if (record.status === 'Holiday') sectionWiseData[key].holiday++;
      });
    });

    Object.keys(sectionWiseData).forEach((key) => {
      const data = sectionWiseData[key];
      const totalMarked = data.present + data.absent + data.leave;
      data.percentage = totalMarked > 0 ? Math.round((data.present / totalMarked) * 100) : 0;
    });

    res.json(Object.values(sectionWiseData));
  } catch (error) {
    console.error('Error fetching class wise attendance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Attendance By Date Report
// ---------------------------------------------------
const getAttendanceByDateReport = async (req, res) => {
  try {
    const { date, className, section } = req.query;

    if (!date) {
      return res.json([]);
    }

    let matchConditions = { date: toUTCMidnight(date) };

    if (className) matchConditions.className = className;
    if (section) matchConditions.section = section;

    const attendanceRecords = await Attendance.find(matchConditions);

    const allRecords = [];
    attendanceRecords.forEach((attendance) => {
      attendance.records.forEach((record) => {
        allRecords.push({
          className: attendance.className,
          section: attendance.section,
          admissionNo: record.admissionNo,
          rollNo: record.rollNo,
          name: record.name,
          status: record.status,
          inTime: record.inTime,
          outTime: record.outTime,
          note: record.note
        });
      });
    });

    res.json(allRecords);
  } catch (error) {
    console.error('Error fetching attendance by date report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Absent Student Report
// ---------------------------------------------------
const getAbsentStudentReport = async (req, res) => {
  try {
    const { fromDate, toDate, className, section } = req.query;

    let matchConditions = {};

    if (fromDate && toDate) {
      matchConditions.date = {
        $gte: toUTCMidnight(fromDate),
        $lte: toUTCMidnight(toDate)
      };
    }

    if (className) matchConditions.className = className;
    if (section) matchConditions.section = section;

    const attendanceRecords = await Attendance.find(matchConditions).select('date className section records');

    const absentStudents = {};

    attendanceRecords.forEach((attendance) => {
      attendance.records.forEach((record) => {
        if (record.status === 'Absent') {
          const key = record.admissionNo;
          if (!absentStudents[key]) {
            absentStudents[key] = {
              admissionNo: record.admissionNo,
              rollNo: record.rollNo,
              name: record.name,
              className: attendance.className,
              section: attendance.section,
              absentDays: 0,
              dates: []
            };
          }
          absentStudents[key].absentDays++;
          absentStudents[key].dates.push(attendance.date.toISOString().split('T')[0]);
        }
      });
    });

    const results = Object.values(absentStudents).sort((a, b) => b.absentDays - a.absentDays);

    res.json(results);
  } catch (error) {
    console.error('Error fetching absent student report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Unmarked Attendance Report
// ---------------------------------------------------
const getUnmarkedAttendanceReport = async (req, res) => {
  try {
    const { fromDate, toDate, className, section } = req.query;

    let matchConditions = {};

    if (fromDate && toDate) {
      matchConditions.date = {
        $gte: toUTCMidnight(fromDate),
        $lte: toUTCMidnight(toDate)
      };
    }

    if (className) matchConditions.className = className;
    if (section) matchConditions.section = section;

    // Find all attendance records with unmarked students
    const attendanceRecords = await Attendance.find(matchConditions).select('date className section records');

    const unmarkedDates = [];

    attendanceRecords.forEach((attendance) => {
      const unmarkedRecords = attendance.records.filter(r => r.status === 'Not Marked' || !r.status);
      if (unmarkedRecords.length > 0) {
        unmarkedDates.push({
          date: attendance.date.toISOString().split('T')[0],
          className: attendance.className,
          section: attendance.section,
          unmarkedCount: unmarkedRecords.length,
          totalStudents: attendance.records.length
        });
      }
    });

    res.json(unmarkedDates);
  } catch (error) {
    console.error('Error fetching unmarked attendance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Custom Attendance Report
// ---------------------------------------------------
const getCustomAttendanceReport = async (req, res) => {
  try {
    const { fromDate, toDate, className, section, status, admissionNo } = req.query;

    let matchConditions = {};

    if (fromDate && toDate) {
      matchConditions.date = {
        $gte: toUTCMidnight(fromDate),
        $lte: toUTCMidnight(toDate)
      };
    }

    if (className) matchConditions.className = className;
    if (section) matchConditions.section = section;

    if (admissionNo) {
      matchConditions['records.admissionNo'] = admissionNo;
    }

    const attendanceRecords = await Attendance.find(matchConditions).select('date className section records');

    let filteredRecords = [];

    attendanceRecords.forEach((attendance) => {
      attendance.records.forEach((record) => {
        if (admissionNo && record.admissionNo !== admissionNo) return;
        if (status && record.status !== status) return;

        filteredRecords.push({
          date: attendance.date.toISOString().split('T')[0],
          className: attendance.className,
          section: attendance.section,
          admissionNo: record.admissionNo,
          rollNo: record.rollNo,
          name: record.name,
          status: record.status,
          inTime: record.inTime,
          outTime: record.outTime,
          note: record.note
        });
      });
    });

    res.json(filteredRecords);
  } catch (error) {
    console.error('Error fetching custom attendance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Get Attendance Stats for Dashboard
// ---------------------------------------------------
const getAttendanceStats = async (req, res) => {
  try {
    const today = toUTCMidnight(new Date());

    // Get total students
    const totalStudents = await StudentDetail.countDocuments({ status: 'active' });

    // Get today's attendance
    const todayAttendance = await Attendance.findOne({ date: today });

    let presentToday = 0;
    let absentToday = 0;

    if (todayAttendance) {
      todayAttendance.records.forEach(record => {
        if (record.status === 'Present') presentToday++;
        else if (record.status === 'Absent') absentToday++;
      });
    }

    // Calculate average attendance (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const recentAttendance = await Attendance.find({
      date: { $gte: thirtyDaysAgo, $lte: today }
    }).select('records');

    let totalRecords = 0;
    let totalPresent = 0;

    recentAttendance.forEach(attendance => {
      attendance.records.forEach(record => {
        if (record.status !== 'Holiday') {
          totalRecords++;
          if (record.status === 'Present') totalPresent++;
        }
      });
    });

    const averageAttendance = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    res.json({
      totalStudents,
      presentToday,
      absentToday,
      averageAttendance
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------
// Get Attendance Report by Type
// ---------------------------------------------------
const getAttendanceReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { fromDate, toDate, className, section, date, status, admissionNo } = req.query;

    switch (reportId) {
      case 'general':
        return await getGeneralAttendanceReport(req, res);
      case 'class-wise':
        return await getClassWiseAttendanceReport(req, res);
      case 'by-date':
        return await getAttendanceByDateReport(req, res);
      case 'absent':
        return await getAbsentStudentReport(req, res);
      case 'unmarked':
        return await getUnmarkedAttendanceReport(req, res);
      case 'custom':
        return await getCustomAttendanceReport(req, res);
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudentsForAttendance,
  saveAttendance,
  getAttendanceRecords,
  getStudentAttendanceSummary,
  getStudentAttendanceDetails,
  getStudentRecentAttendance,
  getStudentAttendanceCalendar,
  markHolidayRange,
  downloadAttendanceReport,
  getGeneralAttendanceReport,
  getClassWiseAttendanceReport,
  getAttendanceByDateReport,
  getAbsentStudentReport,
  getUnmarkedAttendanceReport,
  getCustomAttendanceReport,
  getAttendanceStats,
  getAttendanceReport
};
