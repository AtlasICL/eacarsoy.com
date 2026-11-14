/**
 * Slideshow component with navigation
 * Supports multiple slideshows on a single page with independent navigation
 * Uses CSS grid overlay so all slides contribute to container sizing
 */
(function () {
  var slideshows;
  var slideIndices;

  document.addEventListener("DOMContentLoaded", function () {
    slideshows = document.querySelectorAll(".slideshow-wrapper");
    slideIndices = Array(slideshows.length).fill(1);

    slideshows.forEach(function (slideshow, index) {
      showSlides(1, index);

      // Previous/next button handlers
      slideshow.querySelector(".prev").addEventListener("click", function () {
        changeSlide(-1, index);
      });

      slideshow.querySelector(".next").addEventListener("click", function () {
        changeSlide(1, index);
      });

      // Navigation dot handlers
      slideshow.querySelectorAll(".dot").forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          goToSlide(dotIndex + 1, index);
        });
      });

      // Keyboard: left/right arrows while the slideshow (or one of its buttons) has focus
      slideshow.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          changeSlide(-1, index);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          changeSlide(1, index);
        }
      });

      // Touch: swipe left/right on the photo to change slide
      var container = slideshow.querySelector(".slideshow-container");
      var startX = null;
      var startY = null;
      container.addEventListener(
        "touchstart",
        function (event) {
          if (event.touches.length !== 1) {
            startX = null;
            return;
          }
          startX = event.touches[0].clientX;
          startY = event.touches[0].clientY;
        },
        { passive: true },
      );
      container.addEventListener(
        "touchend",
        function (event) {
          if (startX === null) return;
          var dx = event.changedTouches[0].clientX - startX;
          var dy = event.changedTouches[0].clientY - startY;
          startX = null;
          // Only count clearly horizontal swipes, so vertical page scrolling still works
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            changeSlide(dx < 0 ? 1 : -1, index);
          }
        },
        { passive: true },
      );
    });
  });

  /**
   * Navigate to previous or next slide
   * @param {number} n - Direction: -1 for previous, 1 for next
   * @param {number} slideshowIndex - Index of the slideshow to affect
   */
  function changeSlide(n, slideshowIndex) {
    showSlides((slideIndices[slideshowIndex] += n), slideshowIndex);
  }

  /**
   * Jump to a specific slide
   * @param {number} n - Target slide number (1-based index)
   * @param {number} slideshowIndex - Index of the slideshow to affect
   */
  function goToSlide(n, slideshowIndex) {
    showSlides((slideIndices[slideshowIndex] = n), slideshowIndex);
  }

  /**
   * Update slideshow display to show the specified slide
   * Handles slide wraparound and updates indicators
   * Uses visibility + active class instead of display toggling
   * so all slides remain in the grid flow for stable container sizing
   *
   * @param {number} n - Target slide number
   * @param {number} slideshowIndex - Index of the slideshow to affect
   */
  function showSlides(n, slideshowIndex) {
    var slideshow = slideshows[slideshowIndex];
    var slides = slideshow.querySelectorAll(".slide");
    var dots = slideshow.querySelectorAll(".dot");

    // Handle wraparound at beginning and end
    if (n > slides.length) {
      slideIndices[slideshowIndex] = 1;
    }
    if (n < 1) {
      slideIndices[slideshowIndex] = slides.length;
    }

    // Hide all slides and remove active class
    slides.forEach(function (slide) {
      slide.style.visibility = "hidden";
      slide.classList.remove("active");
    });

    // Reset all indicator dots
    dots.forEach(function (dot) {
      dot.classList.remove("active-dot");
      dot.removeAttribute("aria-current");
    });

    // Show the target slide and highlight its indicator
    var currentIndex = slideIndices[slideshowIndex] - 1;
    slides[currentIndex].style.visibility = "visible";
    slides[currentIndex].classList.add("active");
    dots[currentIndex].classList.add("active-dot");
    dots[currentIndex].setAttribute("aria-current", "true");
  }
})();
