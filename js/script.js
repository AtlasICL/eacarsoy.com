// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');

    // Split pathname and remove empty segments (handles trailing slashes)
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
    let currentPage = pathSegments.pop() || 'index.html';

    navLinks.forEach(link => {
      // Always remove existing aria-current attribute
      link.removeAttribute('aria-current');
      
      const href = link.getAttribute('href');

      // Compare href with currentPage and also allow for a missing ".html"
      if (
          href === currentPage ||
          href === currentPage + '.html' ||
          (currentPage === '' && href === 'index.html')
      ) {
        link.setAttribute('aria-current', 'page');
      }
    });
});
