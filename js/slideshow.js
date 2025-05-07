/**
 * Slideshow component with lazy loading and navigation
 * Supports multiple slideshows on a single page with independent navigation
 */

// Track active slide index for each slideshow instance
const slideshows = document.querySelectorAll('.slideshow-wrapper');
const slideIndices = Array(slideshows.length).fill(1);

// Initialize slideshows when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    slideshows.forEach((slideshow, index) => {
        showSlides(1, index);
        setupLazyLoading(slideshow);
    });
});

/**
 * Navigate to previous or next slide
 * @param {number} n - Direction: -1 for previous, 1 for next
 * @param {number} slideshowIndex - Index of the slideshow to affect
 */
function changeSlide(n, slideshowIndex) {
    showSlides(slideIndices[slideshowIndex] += n, slideshowIndex);
}

/**
 * Jump to a specific slide
 * @param {number} n - Target slide number (1-based index)
 * @param {number} slideshowIndex - Index of the slideshow to affect
 */
function currentSlide(n, slideshowIndex) {
    showSlides(slideIndices[slideshowIndex] = n, slideshowIndex);
}

/**
 * Update slideshow display to show the specified slide
 * Handles slide wraparound, updates indicators, and manages lazy loading
 * 
 * @param {number} n - Target slide number
 * @param {number} slideshowIndex - Index of the slideshow to affect
 */
function showSlides(n, slideshowIndex) {
    const slideshow = slideshows[slideshowIndex];
    const slides = slideshow.querySelectorAll('.slide');
    const dots = slideshow.querySelectorAll('.dot');
    
    // Handle wraparound at beginning and end
    if (n > slides.length) {slideIndices[slideshowIndex] = 1}
    if (n < 1) {slideIndices[slideshowIndex] = slides.length}
    
    // Hide all slides
    slides.forEach(slide => {
        slide.style.display = "none";
    });
    
    // Reset all indicator dots
    dots.forEach(dot => {
        dot.className = dot.className.replace(" active-dot", "");
    });
    
    // Show the target slide and highlight its indicator
    slides[slideIndices[slideshowIndex]-1].style.display = "block";
    dots[slideIndices[slideshowIndex]-1].className += " active-dot";
    
    // Load the current slide's image if it's using lazy loading
    const currentSlide = slides[slideIndices[slideshowIndex]-1];
    const img = currentSlide.querySelector('img[data-src]');
    if (img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    }
    
    // Preload the next slide's image for smoother transitions
    const nextIndex = (slideIndices[slideshowIndex] % slides.length) || slides.length;
    const nextSlide = slides[nextIndex-1];
    const nextImg = nextSlide.querySelector('img[data-src]');
    if (nextImg) {
        const preloadImg = new Image();
        preloadImg.src = nextImg.dataset.src;
    }
}

/**
 * Configure lazy loading for slideshow images
 * First slide loads immediately, others load when slideshow becomes visible
 * 
 * @param {Element} slideshow - Slideshow container element
 */
function setupLazyLoading(slideshow) {
    const slides = slideshow.querySelectorAll('.slide');
    
    // Convert image sources to data attributes except for the first slide
    slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        if (img && index > 0) { // Keep first slide loaded for initial view
            img.dataset.src = img.src;
            img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        }
    });
    
    // Use IntersectionObserver for modern browsers
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Load current slide image when slideshow becomes visible
                    const slideshowIndex = Array.from(slideshows).indexOf(slideshow);
                    const currentIndex = slideIndices[slideshowIndex] - 1;
                    const currentSlide = slides[currentIndex];
                    const img = currentSlide.querySelector('img[data-src]');
                    if (img) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // No need to keep observing once loaded
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px', // Start loading slightly before visible
            threshold: 0.1      // Trigger when 10% visible
        });
        
        // Watch for slideshow entering viewport
        observer.observe(slideshow);
    }
}

// Set up event listeners for slideshow navigation
slideshows.forEach((slideshow, index) => {
    // Previous/next button handlers
    slideshow.querySelector('.prev').onclick = function() {
        changeSlide(-1, index);
    };
    
    slideshow.querySelector('.next').onclick = function() {
        changeSlide(1, index);
    };
    
    // Navigation dot handlers
    const dots = slideshow.querySelectorAll('.dot');
    dots.forEach((dot, dotIndex) => {
        dot.onclick = function() {
            currentSlide(dotIndex + 1, index);
        };
    });
}); 