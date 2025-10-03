const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("⚠ Please enter both username/email and password.");
    return;
  }

  try {
    // Backend placeholder
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
      alert("✅ Login successful! Redirecting...");
      window.location.href = "/dashboard"; // future page
    } else {
      alert("❌ " + result.message);
    }
  } catch (error) {
    alert("⚠ Server error, please try again later.");
  }
});
