const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Validate passbook number
router.post('/validate', [
  body('passbook_no').trim().notEmpty().withMessage('Passbook number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { passbook_no } = req.body;

    // Check if passbook exists in master list
    const memberResult = await db.query(
      'SELECT * FROM members WHERE passbook_no = $1',
      [passbook_no]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid Passbook Number' 
      });
    }

    // Check if already registered
    const registrationResult = await db.query(
      'SELECT * FROM registrations WHERE passbook_no = $1',
      [passbook_no]
    );

    if (registrationResult.rows.length > 0) {
      return res.status(200).json({ 
        valid: false, 
        already_registered: true,
        message: 'Already Registered',
        registration: registrationResult.rows[0]
      });
    }

    // Valid and not registered
    res.json({ 
      valid: true, 
      member: memberResult.rows[0],
      message: 'Valid passbook number' 
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Server error during validation' });
  }
});

// Register member
router.post('/register', [
  body('passbook_no').trim().notEmpty().withMessage('Passbook number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { passbook_no, device_info } = req.body;

    // Check if member exists
    const memberResult = await db.query(
      'SELECT * FROM members WHERE passbook_no = $1',
      [passbook_no]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid Passbook Number' 
      });
    }

    const member = memberResult.rows[0];

    // Check if already registered (double-check to prevent race conditions)
    const existingRegistration = await db.query(
      'SELECT * FROM registrations WHERE passbook_no = $1',
      [passbook_no]
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'Already Registered',
        registration: existingRegistration.rows[0]
      });
    }

    // Register the member
    const registrationResult = await db.query(
      `INSERT INTO registrations (member_id, passbook_no, full_name, device_info) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [member.id, member.passbook_no, member.full_name, device_info || null]
    );

    const registration = registrationResult.rows[0];

    res.status(201).json({ 
      success: true,
      message: 'Registration Successful',
      registration: {
        passbook_no: registration.passbook_no,
        full_name: registration.full_name,
        registration_date: registration.registration_date
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false,
        message: 'Already Registered' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Server error during registration' 
    });
  }
});

// Get registration status
router.get('/status/:passbook_no', async (req, res) => {
  try {
    const { passbook_no } = req.params;

    const result = await db.query(
      'SELECT * FROM registrations WHERE passbook_no = $1',
      [passbook_no]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        registered: false,
        message: 'Not registered' 
      });
    }

    res.json({ 
      registered: true,
      registration: result.rows[0]
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
