// script.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const loginBtn = document.querySelector(".btn");
  const inputs = document.querySelectorAll(".input-group input");

  // Handle form submission with ripple effect
  form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ripple = document.createElement("span");
  ripple.classList.add("ripple");
  loginBtn.appendChild(ripple);

  const rect = loginBtn.getBoundingClientRect();
  ripple.style.left = `${e.clientX - rect.left}px`;
  ripple.style.top = `${e.clientY - rect.top}px`;

  setTimeout(() => ripple.remove(), 600);

  // Check form validity and show alert
  if (form.checkValidity()) {
    alert("✅ Login button clicked (backend not yet connected).");
  }
});

  // Highlight input fields on focus
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement.style.background = "rgba(255,255,255,0.3)";
    });
    input.addEventListener("blur", () => {
      input.parentElement.style.background = "rgba(255,255,255,0.2)";
    });
  });
});
