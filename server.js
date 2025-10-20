const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "smartpayroll_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smartpayroll",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL Database");
});

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM employees WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.send("Database error");
    if (results.length === 0) return res.send("User not found");

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.send("Invalid password");

    req.session.user = user;
    res.redirect("/DASHBOARD.html");
  });
});

// API route to get user info
app.get("/api/user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json({ name: req.session.user.username });
});

// Fetch total employees
//app.get("/api/employees", (req, res) => {
  //db.query("SELECT id, name, dept, position, DATE_FORMAT(date_hired, '%Y-%m-%d') AS date_hired, status FROM employees", (err, results) => {
    //if (err) return res.status(500).json({ error: "DB error" });
    //res.json(results);
  //});
//});

// Add new employee
app.post("/api/employees/add", (req, res) => {
  const {
    name,
    dept,
    position,
    status,
    date_hired,
    salary,
    emergency_contact_name,
    emergency_contact_no,
    contact_no,
    address,
    sss_no,
    philhealth_no,
    pagibig_no,
    atm_no
  } = req.body;

  // basic validation
  if (!name || !dept || !position || !status || !date_hired) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO employees 
    (name, dept, position, status, date_hired, salary, emergency_contact_name, emergency_contact_no, contact_no, address, sss_no, philhealth_no, pagibig_no, atm_no)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    dept,
    position,
    status,
    date_hired,
    salary || null,
    emergency_contact_name || null,
    emergency_contact_no || null,
    contact_no || null,
    address || null,
    sss_no || null,
    philhealth_no || null,
    pagibig_no || null,
    atm_no || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting employee:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }

    console.log("✅ New employee added:", name);
    res.json({ success: true, id: result.insertId });
  });
});

app.get("/api/employees/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM employees WHERE status IN ('Regular', 'Probationary')";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching employee count:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ total: result[0].total });
  });
});

// Fetch specific employee (for edit)
app.get("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM employees WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching employee:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(results[0]);
  });
});

// Update employee
app.put("/api/employees/update/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const sql = `
    UPDATE employees 
    SET name=?, dept=?, position=?, status=?, date_hired=?, salary=?, 
        emergency_contact_name=?, emergency_contact_no=?, contact_no=?, 
        address=?, sss_no=?, philhealth_no=?, pagibig_no=?, atm_no=? 
    WHERE id=?`;

  const values = [
    data.name,
    data.dept,
    data.position,
    data.status,
    data.date_hired,
    data.salary,
    data.emergency_contact_name,
    data.emergency_contact_no,
    data.contact_no,
    data.address,
    data.sss_no,
    data.philhealth_no,
    data.pagibig_no,
    data.atm_no,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error updating employee:", err);
      return res.status(500).json({ error: "Database update failed" });
    }

    console.log("✅ Employee updated:", data.name);
    res.json({ success: true });
  });
});


// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/LOGIN.html");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 SmartPayroll running on http://localhost:${PORT}`));

// Fetch employees (with department filter for the DTR page)
app.get("/api/employees", (req, res) => {
  const { department } = req.query;

  console.log("📩 Received department:", department);

  let sql = `
    SELECT id, name, dept, position, DATE_FORMAT(date_hired, '%Y-%m-%d') AS date_hired, status 
    FROM employees
  `;
  const params = [];

  if (department && department !== "all") {
    sql += " WHERE dept LIKE ?";
    params.push(`%${department}%`);
    console.log("✅ Using filtered query:", sql, params);
  } else {
    console.log("⚠️ No department filter applied.");
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Error fetching employees:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    console.log("🧾 Query results:", results);
    res.json(results);
  });
});


// Fetch DTR records 
app.get("/api/dtr/:employeeId", (req, res) => {
  const { employeeId } = req.params;
  const { coverage } = req.query;
  if (!coverage) return res.status(400).json({ error: "Missing coverage" });

  const [start, end] = coverage.split("_to_");

  const sql = `
    SELECT 
      id, 
      DATE(date) AS date,
      TIME(time_in) AS time_in, 
      TIME(time_out) AS time_out, 
      overtime_minutes AS overtime, 
      undertime_minutes AS undertime, 
      late_minutes AS late
    FROM dtr
    WHERE employee_id = ? 
      AND DATE(date) BETWEEN ? AND ?
    ORDER BY DATE(date) ASC
  `;

  db.query(sql, [employeeId, start, end], (err, results) => {
    if (err) {
      console.error("❌ Error fetching DTR:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    res.json({ records: results });
  });
});


// Update DTR record (undertime, overtime, late)
app.put("/api/dtr/update/:id", (req, res) => {
  const { id } = req.params;
  const { undertime, overtime, late } = req.body;

  const sql = "UPDATE dtr SET undertime = ?, overtime = ?, late = ? WHERE id = ?";
  db.query(sql, [undertime, overtime, late, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating DTR:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({ message: "DTR updated successfully" });
  });
});


// Move employee to resigned_employees
app.post("/api/employees/resign/:id", (req, res) => {
  const { id } = req.params;
  const now = new Date();
  const phDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const date_resigned = phDate.toISOString().split("T")[0];


  // Fetch employee info first
  db.query("SELECT * FROM employees WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) {
      console.error("❌ Error fetching employee:", err);
      return res.status(500).json({ error: "Employee not found" });
    }

    const emp = results[0];

    // Insert into resigned_employees
    const insertSql = `
      INSERT INTO resigned_employees 
      (name, dept, position, status, date_hired, date_resigned, salary, emergency_contact_name, emergency_contact_no, contact_no, address, sss_no, philhealth_no, pagibig_no, atm_no)
      VALUES (?, ?, ?, 'Resigned', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [
      emp.name,
      emp.dept,
      emp.position,
      emp.date_hired,
      date_resigned,
      emp.salary,
      emp.emergency_contact_name,
      emp.emergency_contact_no,
      emp.contact_no,
      emp.address,
      emp.sss_no,
      emp.philhealth_no,
      emp.pagibig_no,
      emp.atm_no
    ];

    console.log("=== RESIGN DEBUG ===");
    console.log("Raw Date (UTC):", now);
    console.log("Converted PH Date:", phDate);
    console.log("Final date_resigned:", date_resigned);
    console.log("Employee fetched:", emp.name);
    console.log("Insert values:", insertValues);
    console.log("====================");


    db.query(insertSql, insertValues, (err2) => {
      if (err2) {
        console.error("❌ Error inserting into resigned_employees:", err2);
        return res.status(500).json({ error: "Database insert failed" });
      }

      // Remove from employees
      db.query("DELETE FROM employees WHERE id = ?", [id], (err3) => {
        if (err3) {
          console.error("❌ Error deleting employee:", err3);
          return res.status(500).json({ error: "Failed to remove from employees" });
        }

        console.log(`✅ Employee ${emp.name} resigned`);
        res.json({ success: true, message: "Employee moved to resigned list" });
      });
    });
  });
});


// Fetch resigned employees
app.get("/api/resigned", (req, res) => {
  const sql = `
    SELECT 
      id, 
      name, 
      dept, 
      position, 
      DATE_FORMAT(date_hired, '%Y-%m-%d') AS date_hired,
      DATE_FORMAT(date_resigned, '%Y-%m-%d') AS date_resigned,
      status 
    FROM resigned_employees
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching resigned employees:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("🧾 Raw DB Results:", results);

    res.json(results);
  });
});


// Reactivate resigned employee
app.post("/api/resigned/reactivate/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM resigned_employees WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Employee not found in resigned list" });
    }

    const emp = results[0];

    const insertSql = `
      INSERT INTO employees 
      (name, dept, position, status, date_hired, salary, emergency_contact_name, emergency_contact_no, contact_no, address, sss_no, philhealth_no, pagibig_no, atm_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [
      emp.name,
      emp.dept,
      emp.position,
      "Regular", 
      emp.date_hired,
      emp.salary,
      emp.emergency_contact_name,
      emp.emergency_contact_no,
      emp.contact_no,
      emp.address,
      emp.sss_no,
      emp.philhealth_no,
      emp.pagibig_no,
      emp.atm_no
    ];

    db.query(insertSql, insertValues, (err2) => {
      if (err2) {
        console.error("❌ Error inserting reactivated employee:", err2);
        return res.status(500).json({ error: "Failed to reactivate employee" });
      }

      // Delete from resigned list
      db.query("DELETE FROM resigned_employees WHERE id = ?", [id], (err3) => {
        if (err3) {
          console.error("❌ Error removing from resigned_employees:", err3);
          return res.status(500).json({ error: "Failed to remove from resigned list" });
        }

        console.log(`✅ Employee ${emp.name} reactivated`);
        res.json({ success: true, message: "Employee reactivated successfully" });
      });
    });
  });
});


// Fetch a single resigned employee
app.get("/api/resigned/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM resigned_employees WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching resigned employee:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Resigned employee not found" });
    }
    res.json(results[0]);
  });
});


// Fetch a single resigned employee
app.get("/api/resigned/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM resigned_employees WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(results[0]);
  });
});

// Update resigned employee
app.put("/api/resigned/update/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const sql = `
    UPDATE resigned_employees 
    SET name=?, dept=?, position=?, date_hired=?, date_resigned=?, salary=?, contact_no=?, address=?
    WHERE id=?`;

  const values = [
    data.name,
    data.dept,
    data.position,
    data.date_hired,
    data.date_resigned,
    data.salary,
    data.contact_no,
    data.address,
    id
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: "Database update failed" });
    res.json({ success: true });
  });
});


// ====== EMPLOYEE TIME IN ======
app.post("/api/dtr/timein", (req, res) => {
  const { name, employeeID } = req.body;
  if (!name || !employeeID) {
    return res.status(400).json({ message: "Missing name or employee ID" });
  }

  // ✅ Timezone-safe PH date and time
  const now = new Date();
  const phDateTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const [datePH, timeIn] = phDateTime.split(", ");

  console.log("=== 🕓 TIME-IN FIXED DEBUG ===");
  console.log("🕰 Raw UTC Date:", now);
  console.log("🇵🇭 Formatted PH DateTime:", phDateTime);
  console.log("📅 Final Date Used:", datePH);
  console.log("⏰ Final Time Used:", timeIn);
  console.log("==============================");

  // ✅ Check if employee already timed in today
  const checkSql = `SELECT * FROM dtr WHERE employee_id = ? AND DATE(date) = ?`;
  db.query(checkSql, [employeeID, datePH], (err, results) => {
    if (err) {
      console.error("❌ Error checking DTR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.json({
        message: `You already timed in today at ${results[0].time_in}`,
      });
    }

    // ✅ Proper INSERT — include employee_name
    const insertSql = `
      INSERT INTO dtr (employee_id, employee_name, date, time_in)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [employeeID, name, datePH, timeIn], (err2) => {
      if (err2) {
        console.error("❌ Error recording time-in:", err2);
        return res.status(500).json({ message: "Error recording time in." });
      }

      console.log(`✅ ${name} (${employeeID}) timed in at ${timeIn}`);
      res.json({ message: `Time in recorded at ${timeIn}` });
    });
  });
});



// ====== EMPLOYEE TIME OUT ======
app.post("/api/dtr/timeout", (req, res) => {
  const { name, employeeID } = req.body;
  if (!name || !employeeID) {
    return res.status(400).json({ message: "Missing name or employee ID" });
  }

  // ✅ Timezone-safe PH date and time
  const now = new Date();
  const phDateTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const [datePH, timeOut] = phDateTime.split(", ");

  console.log("=== 🕓 TIME-OUT FIXED DEBUG ===");
  console.log("🕰 Raw UTC Date:", now);
  console.log("🇵🇭 Formatted PH DateTime:", phDateTime);
  console.log("📅 Final Date Used:", datePH);
  console.log("⏰ Final Time Used:", timeOut);
  console.log("==============================");

  // ✅ Check if employee has a time-in today
  const checkSql = `SELECT * FROM dtr WHERE employee_id = ? AND DATE(date) = ?`;
  db.query(checkSql, [employeeID, datePH], (err, results) => {
    if (err) {
      console.error("❌ Error checking DTR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      // No time-in found, insert a new record with time-out only
      const insertSql = `
        INSERT INTO dtr (employee_id, employee_name, date, time_out)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertSql, [employeeID, name, datePH, timeOut], (err2) => {
        if (err2) {
          console.error("❌ Error inserting time-out:", err2);
          return res.status(500).json({ message: "Error recording time out." });
        }
        console.log(`⚠️ ${name} (${employeeID}) timed out without time-in at ${timeOut}`);
        return res.json({
          message: `Time-out recorded at ${timeOut} (no prior time-in found)`,
        });
      });
    } else {
      // ✅ Update existing DTR record
      const updateSql = `
        UPDATE dtr SET time_out = ? 
        WHERE employee_id = ? AND DATE(date) = ?
      `;
      db.query(updateSql, [timeOut, employeeID, datePH], (err2) => {
        if (err2) {
          console.error("❌ Error updating time-out:", err2);
          return res.status(500).json({ message: "Error recording time out." });
        }
        console.log(`✅ ${name} (${employeeID}) timed out at ${timeOut}`);
        res.json({ message: `Time-out recorded at ${timeOut}` });
      });
    }
  });
});





