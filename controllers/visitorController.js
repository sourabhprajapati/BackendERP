const Visitor = require('../models/Visitor');
// const upload = require('../middleware/upload'); // if not using inline

// POST - Add Visitor
const addVisitor = async (req, res) => {
  try {
    const {
      purpose, name, email, phone, persons,
      idCard, date, inTime, outTime, note
    } = req.body;

    // Convert YYYY-MM-DD → DD-MM-YYYY
    const [y, m, d] = date.split('-');
    const formattedDate = `${d}-${m}-${y}`;

    const visitor = new Visitor({
      purpose,
      name,
      email: email?.trim() || '-',
      phone: phone || '',
      persons: Number(persons) || 1,
      idCard: idCard || '',
      date: formattedDate,
      inTime,
      outTime: outTime?.trim() || '-',
      attachment: req.file ? `/uploads/${req.file.filename}` : null,
      note: note || '',
    });

    await visitor.save();

    // Return only what the frontend table needs
    res.status(201).json({
      email: visitor.email,
      date: visitor.date,
      inTime: visitor.inTime,
      outTime: visitor.outTime,
      createdBy: visitor.createdBy,
    });
  } catch (err) {
    console.error('Add Visitor Error:', err);
    res.status(500).json({ message: 'Failed to add visitor', error: err.message });
  }
};

// GET - All Visitors (for table)
const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .select('email date inTime outTime createdBy');

    res.json(visitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getVisitorsWithName = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .select('name phone purpose date createdAt _id'); // ← Includes name!

    // Convert stored DD-MM-YYYY back to YYYY-MM-DD for frontend date sorting
    const formatted = visitors.map(v => ({
      ...v.toObject(),
      date: (() => {
        const [d, m, y] = v.date.split('-');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      })()
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addVisitor,getVisitorsWithName,
  getVisitors
};