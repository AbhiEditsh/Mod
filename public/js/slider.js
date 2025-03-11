document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.mod-slider');

    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const slides = slider.querySelectorAll('.slide');
        const dots = slider.querySelectorAll('.slider-dot');
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');

        // If there's only one image, hide navigation and return
        if (slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dots.length) slider.querySelector('.slider-nav').style.display = 'none';
            track.style.transform = 'none';
            return;
        }

        let currentSlide = 0;
        let autoScrollInterval;
        let isAnimating = false;

        // Clone first and last slides for infinite effect
        const firstSlideClone = slides[0].cloneNode(true);
        const lastSlideClone = slides[slides.length - 1].cloneNode(true);

        // Preload images
        const preloadImages = () => {
            slides.forEach(slide => {
                const img = slide.querySelector('img');
                if (img) {
                    img.loading = 'eager'; // Force immediate loading
                    const preloadImg = new Image();
                    preloadImg.src = img.src;
                }
            });
        };

        preloadImages();

        track.appendChild(firstSlideClone);
        track.insertBefore(lastSlideClone, slides[0]);

        // Adjust initial position to show first real slide
        track.style.transform = 'translateX(-100%)';

        // Add GPU acceleration
        track.style.transform = 'translate3d(-100%, 0, 0)';
        track.style.willChange = 'transform';

        // Set initial active slide
        slides[0].classList.add('active');

        const updateDots = (index) => {
            // Add transition class to all dots
            dots.forEach(dot => {
                dot.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            });

            dots.forEach(dot => dot.classList.remove('active'));
            const normalizedIndex = (index + slides.length) % slides.length;

            // Add active class with a slight delay for smooth transition
            setTimeout(() => {
                dots[normalizedIndex].classList.add('active');
                // Add rotation on activation
                dots[normalizedIndex].style.transform = 'scale(1.4) rotate(45deg)';
            }, 50);
        };

        const updateActiveSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active', 'next', 'prev'));
            const activeIndex = (index + slides.length) % slides.length;
            slides[activeIndex].classList.add('active');

            // Add next/prev classes for better transitions
            const nextIndex = (activeIndex + 1) % slides.length;
            const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
            slides[nextIndex].classList.add('next');
            slides[prevIndex].classList.add('prev');

            // Update z-index for proper layering
            slides.forEach((slide, i) => {
                if (i === activeIndex) {
                    slide.style.zIndex = '2';
                } else if (i === nextIndex || i === prevIndex) {
                    slide.style.zIndex = '1';
                } else {
                    slide.style.zIndex = '0';
                }
            });
        };

        const goToSlide = (index, animate = true) => {
            if (isAnimating) return;
            isAnimating = true;

            track.style.transition = animate ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
            track.style.transform = `translate3d(-${(index + 1) * 100}%, 0, 0)`;
            currentSlide = index;
            updateDots(currentSlide);
            updateActiveSlide(currentSlide);

            // Reset after animation
            setTimeout(() => {
                isAnimating = false;
                // Handle infinite scroll reset
                if (index === slides.length) {
                    track.style.transition = 'none';
                    currentSlide = 0;
                    track.style.transform = 'translateX(-100%)';
                    requestAnimationFrame(() => {
                        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    });
                    updateActiveSlide(currentSlide);
                    updateDots(currentSlide);
                } else if (index === -1) {
                    track.style.transition = 'none';
                    currentSlide = slides.length - 1;
                    track.style.transform = `translateX(-${slides.length * 100}%)`;
                    requestAnimationFrame(() => {
                        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    });
                    updateActiveSlide(currentSlide);
                    updateDots(currentSlide);
                }
            }, 600);
        };

        // Handle dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (currentSlide !== index) {
                    // Add click animation
                    dot.style.transform = 'scale(0.8) rotate(-45deg)';
                    setTimeout(() => {
                        dot.style.transform = 'scale(1) rotate(0deg)';
                    }, 200);
                    goToSlide(index);
                }
            });

            // Add hover effect
            dot.addEventListener('mouseenter', () => {
                if (!dot.classList.contains('active')) {
                    dot.style.transform = 'scale(1.2) rotate(45deg)';
                }
            });

            dot.addEventListener('mouseleave', () => {
                if (!dot.classList.contains('active')) {
                    dot.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });

        // Handle navigation buttons
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });

        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });

        // Auto-scroll on hover
        slider.addEventListener('mouseenter', () => {
            autoScrollInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 3000);
        });

        slider.addEventListener('mouseleave', () => {
            clearInterval(autoScrollInterval);
        });

        // Handle touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        slider.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        });

        slider.addEventListener('touchend', () => {
            const difference = touchStartX - touchEndX;
            if (Math.abs(difference) > 50) { // Minimum swipe distance
                if (difference > 0) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(currentSlide - 1);
                }
            }
        });

        // Initialize first dot as active
        updateDots(0);
    });
}); 