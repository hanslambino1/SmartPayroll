document.addEventListener("DOMContentLoaded", () => {
  const historyTableBody = document.getElementById("historyTableBody");
  const searchInput = document.getElementById("searchInput");
  const modal = document.getElementById("payslipModal");
  const closeBtn = document.querySelector(".close");
  const payslipDetails = document.getElementById("payslipDetails");

  // ✅ Fetch Payroll History
  fetch("/api/payroll/history")
    .then(res => res.json())
    .then(data => {
      historyTableBody.innerHTML = "";

      data.forEach(item => {
        const totalDeductions =
          parseFloat(item.late_deduction || 0) +
          parseFloat(item.undertime_deduction || 0) +
          parseFloat(item.sss || 0) +
          parseFloat(item.philhealth || 0) +
          parseFloat(item.pagibig || 0) +
          parseFloat(item.tax || 0);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.employee_name}</td>
          <td>${item.department}</td>
          <td>${item.coverage}</td>
          <td>₱${parseFloat(item.basic_salary).toFixed(2)}</td>
          <td>₱${parseFloat(item.daily_rate).toFixed(2)}</td>
          <td>₱${totalDeductions.toFixed(2)}</td>
          <td>₱${parseFloat(item.net_pay).toFixed(2)}</td>
          <td>${new Date(item.created_at).toLocaleDateString()}</td>
          <td><button class="viewBtn" data-id="${item.id}">View</button></td>
        `;
        historyTableBody.appendChild(row);
      });

      // ✅ View Button Functionality (Modal)
      document.querySelectorAll(".viewBtn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          fetch(`/api/payroll/${id}`)
            .then(res => res.json())
            .then(detail => {
              const totalDeductions =
                parseFloat(detail.late_deduction || 0) +
                parseFloat(detail.undertime_deduction || 0) +
                parseFloat(detail.sss || 0) +
                parseFloat(detail.philhealth || 0) +
                parseFloat(detail.pagibig || 0) +
                parseFloat(detail.tax || 0);

              payslipDetails.innerHTML = `
                <p><strong>Employee:</strong> ${detail.employee_name}</p>
                <p><strong>Position:</strong> ${detail.position}</p>
                <p><strong>Department:</strong> ${detail.department}</p>
                <p><strong>Coverage:</strong> ${detail.coverage}</p>
                <hr>

                <p><strong>Basic Salary (Monthly):</strong> ₱${parseFloat(detail.basic_salary).toFixed(2)}</p>
                <p><strong>Daily Rate:</strong> ₱${parseFloat(detail.daily_rate).toFixed(2)}</p>
                <p><strong>Total Earnings:</strong> ₱${parseFloat(detail.total_earnings).toFixed(2)}</p>
                <hr>

                <p><strong>Late Deduction:</strong> ₱${parseFloat(detail.late_deduction).toFixed(2)}</p>
                <p><strong>Undertime Deduction:</strong> ₱${parseFloat(detail.undertime_deduction).toFixed(2)}</p>
                <p><strong>Overtime Pay:</strong> ₱${parseFloat(detail.overtime_pay).toFixed(2)}</p>
                <hr>

                <p><strong>SSS:</strong> ₱${parseFloat(detail.sss).toFixed(2)}</p>
                <p><strong>PhilHealth:</strong> ₱${parseFloat(detail.philhealth).toFixed(2)}</p>
                <p><strong>Pag-IBIG:</strong> ₱${parseFloat(detail.pagibig).toFixed(2)}</p>
                <hr>

                <p><strong>Total Deductions:</strong> ₱${totalDeductions.toFixed(2)}</p>
                <p><strong>Net Pay:</strong> ₱${parseFloat(detail.net_pay).toFixed(2)}</p>
                <p><strong>Date Generated:</strong> ${new Date(detail.created_at).toLocaleString()}</p>
              `;

              modal.classList.add("show");
            });
        });
      });
    })
    .catch(err => console.error("Error loading payroll history:", err));

  // ✅ Close Modal
  closeBtn.onclick = () => modal.classList.remove("show");
  window.onclick = e => { if (e.target === modal) modal.classList.remove("show"); };

  // ✅ Search Filter - works when pressing Enter
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const term = searchInput.value.toLowerCase().trim();
    document.querySelectorAll("#historyTableBody tr").forEach(row => {
      const name = row.children[0].textContent.toLowerCase();
      row.style.display = name.includes(term) ? "" : "none";
    });
  }
});
});
