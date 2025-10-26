const express = require('express');
const router = express.Router();
const db = require('./db.js');
const bcrypt = require('bcryptjs');

// Employee Login
router.post('/login', async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: 'Employee ID and password are required.' });
  }

  try {
    // Fetch employee by ID
    const [rows] = await db.promise().query(
      'SELECT * FROM employees WHERE id = ? AND activity_status = "Active"',
      [id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account.' });
    }

    const employee = rows[0];

    const valid = await bcrypt.compare(password, employee.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Remove password before sending
    const { password: pwd, ...employeeData } = employee;

    // ✅ Set session
req.session.user = {
  id: employeeData.id,
  name: employeeData.name,
  dept: employeeData.dept,  
  position: employeeData.position,
};


   res.json({
  id: employeeData.id,
  name: employeeData.name,
  dept: employeeData.dept,
  position: employeeData.position
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged-in employee profile
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  // Return only the fields you need for homepage
  const { id, name, dept, position } = req.session.user;
  res.json({ id, name, dept, position });
});


// Get latest basic salary for logged-in employee
router.get('/employees/salary', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const employeeId = req.session.user.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT basic_salary 
       FROM payroll 
       WHERE employee_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [employeeId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'No salary record found' });
    }

    res.json({ basic_salary: rows[0].basic_salary });
  } catch (err) {
    console.error('Error fetching salary:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
////////////////////////////////////////////////////////////////////

// Optionally: logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Get all payslip periods for a specific employee
router.get('/employees/payslip/periods', async (req, res) => {
  const employeeId = req.query.employee_id;
  if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });

  try {
    const [rows] = await db.promise().query(
      `SELECT id, coverage, created_at, net_pay 
       FROM payroll 
       WHERE employee_id = ? 
       ORDER BY created_at DESC`,
      [employeeId]
    );
    res.json(rows); // send array of payslip periods
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single payslip by payroll id
router.get('/employees/payslip/:id', async (req, res) => {
  const payrollId = req.params.id;
  
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM payroll WHERE id = ?`,
      [payrollId]
    );

    if (!rows.length) return res.status(404).json({ message: "Payslip not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
