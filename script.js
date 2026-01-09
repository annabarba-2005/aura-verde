// ===== DOM ELEMENTS =====
const preloader = document.getElementById('preloader');
const header = document.getElementById('header');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const searchBtn = document.getElementById('search-btn');
const searchModal = document.getElementById('search-modal');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartFooter = document.getElementById('cart-footer');
const cartTotalPrice = document.getElementById('cart-total-price');
const overlay = document.getElementById('overlay');
const backToTop = document.getElementById('back-to-top');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
const addToCartBtns = document.querySelectorAll('.add-to-cart');
const wishlistBtns = document.querySelectorAll('.product-card__wishlist');
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialDots = document.querySelectorAll('.testimonials__dots .dot');
const prevBtn = document.querySelector('.testimonial-nav-btn.prev');
const nextBtn = document.querySelector('.testimonial-nav-btn.next');
const newsletterForm = document.getElementById('newsletter-form');
const contactForm = document.getElementById('contact-form');
const statNumbers = document.querySelectorAll('.stat__number');

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('ecolife-cart')) || [];

// ===== PRELOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        
        // Initialize AOS-like animations after preloader
        initScrollAnimations();
        
        // Animate stats counter
        animateCounters();
    }, 1500);
});

// ===== HEADER SCROLL EFFECT =====
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Show/hide back to top button
    if (currentScroll > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    
    lastScroll = currentScroll;
});

// ===== MOBILE NAVIGATION =====
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    });
}

if (navClose) {
    navClose.addEventListener('click', closeNav);
}

function closeNav() {
    navMenu.classList.remove('show');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// Close nav when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeNav();
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// ===== SEARCH MODAL =====
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        searchModal.classList.add('active');
        document.body.classList.add('no-scroll');
        setTimeout(() => searchInput.focus(), 300);
    });
}

if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
}

function closeSearch() {
    searchModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
    searchInput.value = '';
}

// Close search on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSearch();
        closeCart();
        closeNav();
    }
});

// Suggestion tags click
document.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        searchInput.value = tag.textContent;
        searchInput.focus();
    });
});

// ===== CART SIDEBAR =====
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    });
}

if (cartClose) {
    cartClose.addEventListener('click', closeCart);
}

function closeCart() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// Close modals when clicking overlay
if (overlay) {
    overlay.addEventListener('click', () => {
        closeCart();
        closeNav();
    });
}

// ===== ADD TO CART =====
addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        
        // Check if item already in cart
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                quantity: 1,
                emoji: getProductEmoji(id)
            });
        }
        
        updateCart();
        showToast(`${name} добавлен в корзину!`);
        
        // Button animation
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 1000);
    });
});

function getProductEmoji(id) {
    const emojis = {
        '1': '🧴',
        '2': '🪥',
        '3': '👜',
        '4': '🍵',
        '5': '🧼',
        '6': '🫙',
        '7': '🍶',
        '8': '🍯'
    };
    return emojis[id] || '📦';
}

function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Корзина пуста</p>
                <span>Добавьте товары для оформления заказа</span>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item__image">${item.emoji}</div>
                <div class="cart-item__info">
                    <h4 class="cart-item__name">${item.name}</h4>
                    <span class="cart-item__price">${formatPrice(item.price)} руб.</span>
                    <div class="cart-item__quantity">
                        <button class="quantity-decrease" aria-label="Уменьшить">−</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-increase" aria-label="Увеличить">+</button>
                    </div>
                </div>
                <button class="cart-item__remove" aria-label="Удалить">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');
        
        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPrice.textContent = `${formatPrice(total)} руб.`;
        cartFooter.style.display = 'block';
        
        // Add event listeners to cart items
        attachCartItemListeners();
    }
    
    // Save to localStorage
    localStorage.setItem('ecolife-cart', JSON.stringify(cart));
}

function attachCartItemListeners() {
    // Quantity decrease
    document.querySelectorAll('.quantity-decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            const cartItem = btn.closest('.cart-item');
            const id = cartItem.dataset.id;
            const item = cart.find(i => i.id === id);
            
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(i => i.id !== id);
            }
            
            updateCart();
        });
    });
    
    // Quantity increase
    document.querySelectorAll('.quantity-increase').forEach(btn => {
        btn.addEventListener('click', () => {
            const cartItem = btn.closest('.cart-item');
            const id = cartItem.dataset.id;
            const item = cart.find(i => i.id === id);
            item.quantity += 1;
            updateCart();
        });
    });
    
    // Remove item
    document.querySelectorAll('.cart-item__remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const cartItem = btn.closest('.cart-item');
            const id = cartItem.dataset.id;
            cart = cart.filter(i => i.id !== id);
            updateCart();
        });
    });
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Initialize cart on page load
updateCart();

// ===== WISHLIST =====
wishlistBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.classList.toggle('active');
        
        if (btn.classList.contains('active')) {
            showToast('Добавлено в избранное!');
        } else {
            showToast('Удалено из избранного');
        }
    });
});

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== PRODUCT FILTERS =====
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        productCards.forEach(card => {
            const category = card.dataset.category;
            
            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ===== TESTIMONIALS SLIDER =====
let currentTestimonial = 0;

function showTestimonial(index) {
    testimonialCards.forEach((card, i) => {
        card.classList.remove('active');
        testimonialDots[i].classList.remove('active');
    });
    
    testimonialCards[index].classList.add('active');
    testimonialDots[index].classList.add('active');
    currentTestimonial = index;
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        let newIndex = currentTestimonial - 1;
        if (newIndex < 0) newIndex = testimonialCards.length - 1;
        showTestimonial(newIndex);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        let newIndex = currentTestimonial + 1;
        if (newIndex >= testimonialCards.length) newIndex = 0;
        showTestimonial(newIndex);
    });
}

testimonialDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showTestimonial(index);
    });
});

// Auto-advance testimonials
setInterval(() => {
    let newIndex = currentTestimonial + 1;
    if (newIndex >= testimonialCards.length) newIndex = 0;
    showTestimonial(newIndex);
}, 6000);

// ===== BACK TO TOP =====
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== SCROLL ANIMATIONS (AOS-like) =====
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
    statNumbers.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString('ru-RU');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString('ru-RU');
            }
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCounter();
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ===== FORM SUBMISSIONS =====
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Спасибо за подписку! Скидка 10% отправлена на ваш email.');
        newsletterForm.reset();
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
        contactForm.reset();
    });
}

// ===== PARALLAX EFFECT FOR HERO SHAPES =====
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.hero__shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ===== HOVER EFFECTS FOR PRODUCT CARDS =====
productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', () => {
        setTimeout(() => {
            card.style.zIndex = '1';
        }, 300);
    });
});

// ===== LAZY LOADING IMAGES =====
const lazyImages = document.querySelectorAll('img[data-src]');

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    // Tab trap for modals
    if (searchModal.classList.contains('active') || cartSidebar.classList.contains('active') || navMenu.classList.contains('show')) {
        if (e.key === 'Tab') {
            // Handle tab navigation within modal
        }
    }
});

// ===== ANIMATION KEYFRAMES (added dynamically) =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .add-to-cart.added {
        animation: pulse 0.3s ease;
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(styleSheet);

// ===== CONSOLE GREETING =====
console.log('%c🌿 EcoLife - Экологически чистые товары', 'color: #4a7c59; font-size: 20px; font-weight: bold;');
console.log('%cСпасибо, что выбираете экологичный образ жизни!', 'color: #2d5a3d; font-size: 14px;');

