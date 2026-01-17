// // index.js
// const express = require('express');
// const mongoose=require('mongoose')
// const cors = require('cors');
// const connectDB = require('./config/db');
// const schoolinfoRoutes = require('./routes/schoolinfoRoutes');
// require('dotenv').config();

// const app = express();
// connectDB();
// // Middleware

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static('uploads'));



// // Create uploads folder if not exists
// const fs = require('fs');
// if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
// // Test route
// app.get('/', (req, res) => {
//   res.json({ message: 'Express server running on Windows!' });
// });

// // 404
// // app.use('*', (req, res) => {
// //   res.status(404).json({ error: 'Route not found' });
// // });
// // Test saving data to Atlas
// // app.get('/test-db', async (req, res) => {
// //   try {
// //     const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
// //     await Test.create({ name: 'Rahul from India' });
// //     res.json({ success: true, message: 'Data saved to Atlas!' });
// //   } catch (err) {
// //     res.json({ error: err.message });
// //   }
// // });
// // Routes
// const studentDetailRoutes = require('./routes/studentdetailRoutes');

// app.use('/api/students', studentDetailRoutes);
// const classRoutes = require('./routes/classRoutes');
// const subjectRoutes = require('./routes/subjectRoutes');
// app.use('/api/subjects', subjectRoutes);
// app.use('/api/classes', classRoutes);
// app.use('/api/schools', require('./routes/schoolRoutes'));
// app.use('/api/digital', require('./routes/digitalRoutes'));
// app.use('/api/sales-executive', require('./routes/salesExecutive'));
// app.use('/api/sales-executives', require('./routes/salesExecutiveRoutes'));
// app.use('/api/schoolinfo', schoolinfoRoutes);
// app.use('/api/school', require('./routes/bankDetailRoutes'));
// app.use('/api/admission', require('./routes/admissionRoutes'));
// app.use('/api/visitors', require('./routes/visitorRoutes'));
// app.use('/api/complaints', require('./routes/complaintRoutes'));
// app.use('/api/concessions', require('./routes/concessionRoutes'));
// app.use('/api/staff', require('./routes/staffRoutes'));
// app.use('/api/students', require('./routes/studentRoutes'));
// app.use('/api/registration', require('./routes/registrationRoutes'));
// app.use('/api/staff-attendance', require('./routes/staffAttendanceRoutes'));
// const classTeacherRoutes = require('./routes/classTeacherRoutes');

// app.use('/api/class-teacher', classTeacherRoutes);
// const staffLeaveRoutes = require('./routes/staffLeaveRoutes');
// app.use('/api/staff-leaves', staffLeaveRoutes);
// const concessionRoutes = require("./routes/concession.routes");
// app.use("/api/concession", concessionRoutes);
// const feeRoutes = require("./routes/fee.routes");
// app.use("/api/fees", feeRoutes);
// const classFeeAllocationRoutes = require("./routes/classFeeAllocation.routes");
// app.use("/api/class-fee-allocation", classFeeAllocationRoutes);
// const lockFeesRoutes = require("./routes/lockFeesModification.routes");

// app.use("/api/lock-fees", lockFeesRoutes);
// const lateFeeRoutes = require("./routes/lateFee.routes");

// app.use("/api/late-fee", lateFeeRoutes);

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// ================== DB ==================
connectDB();

// ================== Middleware ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== Uploads Folder ==================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 🔥 Absolute static path for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================== Test Route ==================
app.get("/", (req, res) => {
  res.json({ message: "Express server running on Windows!" });
});

// ================== Student & Academic Routes ==================
app.use("/api/students", require("./routes/studentdetailRoutes"));
app.use("/api/students/promotion", require("./routes/promotionRoutes"));

app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
// app.use("/api/timetables", require("./routes/timetableRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));

// ================== School & Admin Routes ==================
app.use("/api/schools", require("./routes/schoolRoutes"));
app.use("/api/schoolinfo", require("./routes/schoolinfoRoutes"));
app.use("/api/school", require("./routes/bankDetailRoutes"));

app.use("/api/digital", require("./routes/digitalRoutes"));
app.use("/api/registration", require("./routes/registrationRoutes"));
app.use("/api/admission", require("./routes/admissionRoutes"));

// ================== Staff Routes ==================
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/staff-attendance", require("./routes/staffAttendanceRoutes"));
app.use("/api/staff-leaves", require("./routes/staffLeaveRoutes"));
app.use("/api/class-teacher", require("./routes/classTeacherRoutes"));

// ================== Leave Routes ==================
app.use("/api/leaves", require("./routes/leaveRoutes"));

// ================== Sales & Visitors ==================
app.use("/api/sales-executive", require("./routes/salesExecutive"));
app.use("/api/sales-executives", require("./routes/salesExecutiveRoutes"));
app.use("/api/visitors", require("./routes/visitorRoutes"));

// ================== Complaints ==================
app.use("/api/complaints", require("./routes/complaintRoutes"));

// ================== Fees & Concession ==================
app.use("/api/concessions", require("./routes/concessionRoutes"));
app.use("/api/concession", require("./routes/concession.routes"));

app.use("/api/fees", require("./routes/fee.routes"));
app.use("/api/class-fee-allocation", require("./routes/classFeeAllocation.routes"));
app.use("/api/lock-fees", require("./routes/lockFeesModification.routes"));
app.use("/api/late-fee", require("./routes/lateFee.routes"));

// ================== Error Handler ==================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ================== Server ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
