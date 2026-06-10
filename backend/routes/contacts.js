const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit a contact form
router.post('/', async (req, res) => {
  console.log('Received contact form submission:', req.body);
  const { name, email, phone, subject, message } = req.body;
  
  const contact = new Contact({
    name,
    email,
    phone,
    subject,
    message
  });

  try {
    const newContact = await contact.save();
    res.status(201).json({ success: true, message: 'Message sent successfully', data: newContact });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all contact messages (for admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
