document.addEventListener("DOMContentLoaded", () => {
  const amounts = document.querySelectorAll(".amount");

  // Restrict to numbers + single decimal point
  amounts.forEach(cell => {
    cell.addEventListener("input", () => {
      let value = cell.textContent.replace(/[^0-9.]/g, ""); // Remove non-numeric and non-dot
      // Prevent multiple decimal points
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }
      cell.textContent = value;
    });
  });

  // Compute Net Salary when button clicked
  document.getElementById("computeBtn").addEventListener("click", () => {
    const rows = document.querySelectorAll("#payrollTable tbody tr");

    rows.forEach(row => {
      let salary = parseFloat(row.querySelector(".salary").textContent) || 0;
      let deduction = parseFloat(row.querySelector(".deduction").textContent) || 0;
      let net = salary - deduction;

      // Update Net Salary cell (2 decimal places), ensure non-negative
      row.querySelector(".net").textContent = Math.max(0, net).toFixed(2);
    });
  });
});
