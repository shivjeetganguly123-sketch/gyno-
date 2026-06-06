// ============================================================
//  Women's Care Clinic — single-file server
//  NO extra folders needed. Just keep these together in my-server:
//     server.js   (this file)
//     index.html  (the website)
//     .env        (your settings)
//  Then run:  node server.js
// ============================================================

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the website (index.html sitting next to this file)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Check the database address exists ----
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing. Create a ".env" file next to server.js with your connection string.');
}

// ---- Connect to MongoDB ----
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ============================================================
//  DATABASE MODELS
// ============================================================
const Appointment = mongoose.model('Appointment', new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  date:    { type: String, required: true },
  message: { type: String, default: '', trim: true },
}, { timestamps: true }));

const Contact = mongoose.model('Contact', new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  phone:   { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
}, { timestamps: true }));

// ============================================================
//  HELPERS
// ============================================================
function shapeAppointment(a) {
  return {
    id: a._id.toString(),
    name: a.name,
    phone: a.phone,
    email: a.email,
    date: a.date,
    message: a.message,
    submitted: new Date(a.createdAt).toLocaleString('en-IN'),
  };
}

function requireAdmin(req, res, next) {
  const pass = req.header('x-admin-password');
  if (pass && pass === process.env.ADMIN_PASSWORD) return next();
  return res.status(401).json({ ok: false, error: 'Unauthorized' });
}

// ============================================================
//  API ROUTES
// ============================================================

// PUBLIC: book an appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, phone, email, date, message } = req.body;
    if (!name || !phone || !email || !date) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }
    await Appointment.create({ name, phone, email, date, message: message || '' });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /api/appointments', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// PUBLIC: contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }
    await Contact.create({ name, email, phone, message });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /api/contact', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// ADMIN: login check
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: 'Wrong password' });
});

// ADMIN: list all appointments (newest first)
app.get('/api/appointments', requireAdmin, async (req, res) => {
  try {
    const appts = await Appointment.find().sort({ createdAt: -1 });
    res.json(appts.map(shapeAppointment));
  } catch (err) {
    console.error('GET /api/appointments', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// ADMIN: delete one appointment
app.delete('/api/appointments/:id', requireAdmin, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/appointments/:id', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// ADMIN: delete ALL appointments
app.delete('/api/appointments', requireAdmin, async (req, res) => {
  try {
    await Appointment.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/appointments', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// ============================================================
//  START
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
