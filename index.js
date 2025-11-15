// index.js
const express = require('express');
const mongoose=require('mongoose')
const cors = require('cors');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();
connectDB();
// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Express server running on Windows!' });
});

// 404
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });
// Test saving data to Atlas
app.get('/test-db', async (req, res) => {
  try {
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await Test.create({ name: 'Rahul from India' });
    res.json({ success: true, message: 'Data saved to Atlas!' });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});