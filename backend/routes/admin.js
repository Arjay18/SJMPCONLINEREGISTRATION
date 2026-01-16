const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload Excel master list
router.post('/upload-members', upload.single('file'), async (req, res) => {
  console.log('Upload request received');
  console.log('File:', req.file);
  console.log('Body:', req.body);
  
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Reading Excel file:', req.file.path);
    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log('Excel data rows:', data.length);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    // Validate required columns
    const firstRow = data[0];
    console.log('First row columns:', Object.keys(firstRow));
    
    if (!firstRow.passbook_no || !firstRow.full_name) {
      return res.status(400).json({ 
        error: 'Excel file must have columns: passbook_no, full_name',
        foundColumns: Object.keys(firstRow)
      });
    }

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    // Insert members into database
    for (const row of data) {
      try {
        if (!row.passbook_no || !row.full_name) {
          skipped++;
          continue;
        }

        const passbookNo = row.passbook_no.toString().trim();
        const fullName = row.full_name.toString().trim();
        
        await db.query(
          `INSERT INTO members (passbook_no, full_name) 
           VALUES ($1, $2) 
           ON CONFLICT (passbook_no) DO UPDATE 
           SET full_name = $3, updated_at = CURRENT_TIMESTAMP`,
          [passbookNo, fullName, fullName]
        );
        inserted++;
      } catch (error) {
        console.error('Error inserting row:', error);
        errors.push({ row, error: error.message });
        skipped++;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true,
      message: 'Members uploaded successfully',
      inserted,
      skipped,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Error processing Excel file',
      message: error.message,
      details: error.toString()
    });
  }
});

// Get all registered members
router.get('/registrations', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        r.id,
        r.passbook_no,
        r.full_name,
        r.registration_date,
        r.device_info
       FROM registrations r
       ORDER BY r.registration_date DESC`
    );

    res.json({ 
      success: true,
      count: result.rows.length,
      registrations: result.rows 
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export registered members to Excel
router.get('/export-registrations', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        passbook_no,
        full_name,
        datetime(registration_date) as registration_date,
        device_info
       FROM registrations
       ORDER BY registration_date DESC`
    );

    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(result.rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for download
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error exporting data' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const totalMembers = await db.query('SELECT COUNT(*) as count FROM members');
    const totalRegistered = await db.query('SELECT COUNT(*) as count FROM registrations');
    const todayRegistered = await db.query(
      `SELECT COUNT(*) as count FROM registrations 
       WHERE DATE(registration_date) = DATE('now')`
    );

    res.json({
      success: true,
      stats: {
        total_members: parseInt(totalMembers.rows[0].count),
        total_registered: parseInt(totalRegistered.rows[0].count),
        today_registered: parseInt(todayRegistered.rows[0].count),
        pending: parseInt(totalMembers.rows[0].count) - parseInt(totalRegistered.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all members (master list)
router.get('/members', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM members ORDER BY created_at DESC'
    );

    res.json({ 
      success: true,
      count: result.rows.length,
      members: result.rows 
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all members (for testing)
router.delete('/members/all', async (req, res) => {
  try {
    await db.query('DELETE FROM registrations');
    await db.query('DELETE FROM members');
    
    res.json({ 
      success: true,
      message: 'All data cleared' 
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
