document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".btn");
  const inputs = document.querySelectorAll(".input-group input");

  // Ripple effect on button click (pure visual)
  loginBtn.addEventListener("click", (e) => {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    loginBtn.appendChild(ripple);

    const rect = loginBtn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    setTimeout(() => ripple.remove(), 600);
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

// Modals
function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Close modals when clicking outside
window.onclick = function(event) {
  const privacy = document.getElementById("privacyModal");
  const terms = document.getElementById("termsModal");
  if (event.target === privacy) privacy.style.display = "none";
  if (event.target === terms) terms.style.display = "none";
};
