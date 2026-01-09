/**
 * Hero Slider Initialization (Swiper.js)
 * AuraVerde - Eco Store
 * 
 * Features:
 * - Autoplay with 6 second delay
 * - Smooth fade effect between slides
 * - Pagination and navigation
 * - Pause on hover
 * - Animated counters for CO2 statistics
 */

(function() {
    'use strict';

    // ==========================================================================
    // HERO SLIDER (SWIPER)
    // ==========================================================================
    
    /**
     * Initialize the hero slider with Swiper.js
     */
    function initHeroSlider() {
        const heroSwiperEl = document.getElementById('hero-swiper');
        
        if (!heroSwiperEl) {
            console.warn('Hero Swiper element not found');
            return;
        }

        // Initialize Swiper
        const heroSwiper = new Swiper('#hero-swiper', {
            // Core settings
            loop: true,
            speed: 800,
            grabCursor: true,
            
            // Effect
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            
            // Autoplay
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            
            // Pagination
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: false
            },
            
            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            
            // Keyboard control
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            
            // Accessibility
            a11y: {
                enabled: true,
                prevSlideMessage: 'Предыдущий слайд',
                nextSlideMessage: 'Следующий слайд',
                firstSlideMessage: 'Первый слайд',
                lastSlideMessage: 'Последний слайд',
                paginationBulletMessage: 'Перейти к слайду {{index}}'
            },
            
            // Events
            on: {
                init: function() {
                    console.log('Hero Swiper initialized');
                    animateSlideContent(this.slides[this.activeIndex]);
                },
                slideChangeTransitionStart: function() {
                    // Reset animations on all slides
                    this.slides.forEach(slide => {
                        resetSlideAnimations(slide);
                    });
                },
                slideChangeTransitionEnd: function() {
                    // Animate current slide content
                    animateSlideContent(this.slides[this.activeIndex]);
                }
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                heroSwiper.slidePrev();
            } else if (e.key === 'ArrowRight') {
                heroSwiper.slideNext();
            }
        });

        return heroSwiper;
    }

    /**
     * Animate content within a slide
     * @param {HTMLElement} slide - The slide element
     */
    function animateSlideContent(slide) {
        if (!slide) return;

        const badge = slide.querySelector('.hero-slider__badge');
        const title = slide.querySelector('.hero-slider__title');
        const description = slide.querySelector('.hero-slider__description');
        const cta = slide.querySelector('.hero-slider__cta');

        const elements = [badge, title, description, cta].filter(Boolean);

        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    /**
     * Reset animations on a slide
     * @param {HTMLElement} slide - The slide element
     */
    function resetSlideAnimations(slide) {
        if (!slide) return;

        const animatedElements = slide.querySelectorAll(
            '.hero-slider__badge, .hero-slider__title, .hero-slider__description, .hero-slider__cta'
        );

        animatedElements.forEach(el => {
            el.style.transition = 'none';
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });
    }

    // ==========================================================================
    // ECO STATISTICS COUNTER
    // ==========================================================================

    /**
     * Animate counting numbers in the eco-stats section
     */
    function initEcoCounters() {
        const counters = document.querySelectorAll('.eco-stats__number[data-count]');
        
        if (!counters.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    /**
     * Animate a single counter element
     * @param {HTMLElement} counter - The counter element
     */
    function animateCounter(counter) {
        const target = parseInt(counter.dataset.count, 10);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += step;
            
            if (current < target) {
                counter.textContent = formatNumber(Math.floor(current));
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = formatNumber(target);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    /**
     * Format number with spaces for thousands
     * @param {number} num - The number to format
     * @returns {string} Formatted number
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    // ==========================================================================
    // SCROLL ANIMATIONS (AOS-like)
    // ==========================================================================

    /**
     * Initialize scroll-based animations
     */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        if (!animatedElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.aosDelay, 10) || 0;
                    
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, delay);
                    
                    animationObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    /**
     * Initialize all hero slider functionality
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDOMReady);
        } else {
            onDOMReady();
        }
    }

    /**
     * Called when DOM is ready
     */
    function onDOMReady() {
        // Initialize hero slider
        initHeroSlider();
        
        // Initialize eco counters
        initEcoCounters();
        
        // Initialize scroll animations
        initScrollAnimations();
        
        console.log('AuraVerde Hero Slider initialized');
    }

    // Start initialization
    init();

})();

