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
    conditions.push(`department = '${query.department}'`); // if you have department column in employees table
  }
  return conditions.length ? "WHERE " + conditions.join(" AND ") : "";
}

// Tardiness
router.get("/tardiness", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT employee_name AS name, 
           SUM(late_minutes) AS totalLate,
           COUNT(CASE WHEN late_minutes > 0 THEN 1 END) AS lateDays
    FROM dtr
    ${where}
    GROUP BY employee_id
    ORDER BY totalLate DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Undertime
router.get("/undertime", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT employee_name AS name, 
           SUM(undertime_minutes) AS totalUndertime
    FROM dtr
    ${where}
    GROUP BY employee_id
    ORDER BY totalUndertime DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Overtime
router.get("/overtime", (req, res) => {
  const where = buildFilters(req.query);
  const query = `
    SELECT employee_name AS name, 
           SUM(overtime_minutes) AS totalOvertime
    FROM dtr
    ${where}
    GROUP BY employee_id
    ORDER BY totalOvertime DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
