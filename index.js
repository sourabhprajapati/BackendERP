// index.js
const express = require('express');
const mongoose=require('mongoose')
const cors = require('cors');
const connectDB = require('./config/db');
const schoolinfoRoutes = require('./routes/schoolinfoRoutes');
require('dotenv').config();

const app = express();
connectDB();
// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));



// Create uploads folder if not exists
const fs = require('fs');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Express server running on Windows!' });
});

// 404
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });
// Test saving data to Atlas
// app.get('/test-db', async (req, res) => {
//   try {
//     const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
//     await Test.create({ name: 'Rahul from India' });
//     res.json({ success: true, message: 'Data saved to Atlas!' });
//   } catch (err) {
//     res.json({ error: err.message });
//   }
// });
// Routes
app.use('/api/schools', require('./routes/schoolRoutes'));
app.use('/api/digital', require('./routes/digitalRoutes'));
app.use('/api/sales-executive', require('./routes/salesExecutive'));
app.use('/api/sales-executives', require('./routes/salesExecutiveRoutes'));
app.use('/api/schoolinfo', schoolinfoRoutes);
app.use('/api/school', require('./routes/bankDetailRoutes'));
app.use('/api/admission', require('./routes/admissionRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/concessions', require('./routes/concessionRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});