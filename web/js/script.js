// "/", "/index.html", "/projects", "/projects.html" and "/projects/" all
// normalise to the same path, so the match works with or without ".html".
const normalise = (path) =>
  path
    .replace(/\/index(\.html)?$/, "/")
    .replace(/\.html$/, "")
    .replace(/(.)\/$/, "$1");

// Highlight the nav link for the current page
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-right a");

  const currentPath = normalise(window.location.pathname);

  navLinks.forEach((link) => {
    link.removeAttribute("aria-current");
    if (normalise(link.pathname) === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
});
