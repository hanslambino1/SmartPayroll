const express = require("express");
const router = express.Router();
const db = require("./db.js");

router.post("/save", (req, res) => {
  console.log("📥 Received payroll data:", req.body);  
  const payrollData = req.body;

  const sql = `
    INSERT INTO payroll (
      employee_id, employee_name, position, department, basic_salary, daily_rate, 
      late_deduction, undertime_deduction, overtime_pay, total_earnings, 
      sss, philhealth, pagibig, net_pay, coverage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Use a counter to track completed inserts
  let completed = 0;
  let hasError = false;

  payrollData.forEach((record) => {
    const values = [
      record.employee_id,
      record.employee_name,
      record.position,
      record.department,
      record.basic_salary,
      record.daily_rate,
      record.late_deduction,
      record.undertime_deduction,
      record.overtime_pay,
      record.total_earnings,
      record.sss,
      record.philhealth,
      record.pagibig,
      record.net_pay,
      record.coverage,
    ];

    db.query(sql, values, (err) => {
      if (err) {
        console.error("❌ Error saving payroll record:", err);
        if (!hasError) {
          hasError = true;
          return res.status(500).json({ success: false, message: "Failed to save payroll record." });
        }
      }

      completed++;
      if (completed === payrollData.length && !hasError) {
        res.json({ success: true, message: "✅ Payroll records saved successfully!" });
      }
    });
  });
});

// ✅ Get payroll history
router.get("/history", (req, res) => {
  const query = "SELECT * FROM payroll ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching payroll history:", err);
      return res.status(500).json({ message: "Failed to fetch payroll history" });
    }
    res.json(results);
  });
});

// ✅ Get specific payroll by ID (for payslip view)
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM payroll WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching payroll detail:", err);
      return res.status(500).json({ message: "Failed to fetch detail" });
    }
    res.json(result[0]);
  });
});

module.exports = router;



// ✅ Get total payroll processed count
router.get("/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS totalProcessed FROM payroll";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching payroll count:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0]);
  });
});
