// backToTop.js
const backToTopBtn = document.getElementById("backToTopBtn");

// Show/hide button on scroll
window.onscroll = function() {
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
};

// Scroll to top when clicked
backToTopBtn.addEventListener("click", function() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For other browsers
});
