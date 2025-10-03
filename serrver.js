const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Backend placeholder for login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // TEMP check, later connect to MySQL
  if (username === "user@smartpayroll.com" && password === "P@ssword1") {
    res.json({ success: true, message: "Login successful!" });
  } else {
    res.json({ success: false, message: "Invalid username or password." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartPayroll running on http://localhost:${PORT}`);
});
