const express = require("express");
const router = express.Router();
const db = require("./db.js");

// Helper to build WHERE clause
function buildFilters(query) {
  const conditions = [];
  if (query.start && query.end) {
    conditions.push(`date BETWEEN '${query.start}' AND '${query.end}'`);
  }
  if (query.department && query.department !== "all") {
    conditions.push(`department = '${query.department}'`);
  }
  return conditions.length ? "WHERE " + conditions.join(" AND ") : "";
}

// Tardiness (by Employee)
router.get("/tardiness", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT employee_name AS name, 
           SUM(late_minutes) AS totalLate,
           COUNT(CASE WHEN late_minutes > 0 THEN 1 END) AS lateDays
    FROM dtr
    ${where}
    GROUP BY employee_id, employee_name
    ORDER BY totalLate DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// Undertime (by Date) → used in Dashboard
router.get("/undertime", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT DATE(date) AS date, 
           SUM(undertime_minutes) AS totalUndertime
    FROM dtr
    ${where}
    GROUP BY DATE(date)
    ORDER BY DATE(date);
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Undertime (by Employee) → used in Reports Page
router.get("/undertime/employees", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT employee_name AS name,
           SUM(undertime_minutes) AS totalUndertime
    FROM dtr
    ${where}
    GROUP BY employee_id, employee_name
    ORDER BY totalUndertime DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// Overtime (by Date) → used in Dashboard
router.get("/overtime", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT DATE(date) AS date, 
           SUM(overtime_minutes) AS totalOvertime
    FROM dtr
    ${where}
    GROUP BY DATE(date)
    ORDER BY DATE(date);
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Overtime (by Employee) → used in Reports Page
router.get("/overtime/employees", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT employee_name AS name,
           SUM(overtime_minutes) AS totalOvertime
    FROM dtr
    ${where}
    GROUP BY employee_id, employee_name
    ORDER BY totalOvertime DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Payroll Processed Count (for Dashboard)
router.get("/payroll/processed", (req, res) => {
  const query = `SELECT COUNT(*) AS totalProcessed FROM payroll;`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ totalProcessed: results[0].totalProcessed });
  });
});



module.exports = router;
