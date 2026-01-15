let cart = JSON.parse(localStorage.getItem('ecolife-cart')) || [];
let currentSlide = 0;
let currentQuickViewProduct = null;
let currentManufacturer = null;
let carbonChart = null;
let promoCode = null;
let deliveryMethod = 'bike';

const DELIVERY_OPTIONS = {
    bike: { name: 'Велокурьер', price: 0, carbonCoef: 0.95, description: 'Бесплатно, -5% к углеродному следу' },
    electric: { name: 'Электромобиль', price: 5, carbonCoef: 1.0, description: '+5 руб. ПМР ПМР, стандартный след' },
    standard: { name: 'Обычная доставка', price: 10, carbonCoef: 1.1, description: '+10 руб. ПМР ПМР, +10% к следу' }
};

const PACKAGING_CARBON = { none: 0, biodegradable: 0.1, paper: 0.2, glass: 0.3, plastic: 0.5 };
const DELIVERY_DISTANCE = { local: 50, regional: 250, far: 1000 };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initHeader();
    initNavigation();
    initSearch();
    initCart();
    initSlider();
    initProducts();
    initFilters();
    initModals();
    initForms();
    initAnimations();
    initBackToTop();
    initCO2Counter();
    initBlog();
    initArticleModal();
});

function initPreloader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const preloader = $('#preloader');
            if (preloader) preloader.classList.add('preloader--hidden');
            document.body.classList.remove('no-scroll');
        }, 500);
    });
}

function initHeader() {
    const header = $('#header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 50);
    });
}

function initNavigation() {
    const navToggle = $('#nav-toggle');
    const navClose = $('#nav-close');
    const navMenu = $('#nav-menu');
    const overlay = $('#overlay');
    const navLinks = $$('.header__nav-link');

    const openNav = () => {
        navMenu?.classList.add('header__nav--open');
        overlay?.classList.add('overlay--visible');
        document.body.classList.add('no-scroll');
    };

    const closeNav = () => {
        navMenu?.classList.remove('header__nav--open');
        overlay?.classList.remove('overlay--visible');
        document.body.classList.remove('no-scroll');
    };

    navToggle?.addEventListener('click', openNav);
    navClose?.addEventListener('click', closeNav);
    overlay?.addEventListener('click', () => {
        closeNav();
        closeCart();
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeNav();
            navLinks.forEach(l => l.classList.remove('header__nav-link--active'));
            link.classList.add('header__nav-link--active');
        });
    });

    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            e.preventDefault();
            const target = $(href);
            if (target) {
                const headerHeight = $('#header')?.offsetHeight || 80;
                window.scrollTo({ top: target.offsetTop - headerHeight, behavior: 'smooth' });
            }
        });
    });

}

function initSearch() {
    const searchBtn = $('#search-btn');
    const searchModal = $('#search-modal');
    const searchClose = $('#search-close');
    const searchInput = $('#search-input');
    const searchResults = $('#search-results');
    const searchNotFound = $('#search-not-found');
    const searchQueryText = $('#search-query-text');
    let searchTimeout = null;

    const openSearch = () => {
        searchModal?.classList.add('search-modal--active');
        document.body.classList.add('no-scroll');
        setTimeout(() => searchInput?.focus(), 300);
    };

    const closeSearch = () => {
        searchModal?.classList.remove('search-modal--active');
        document.body.classList.remove('no-scroll');
        if (searchInput) searchInput.value = '';
        clearSearchResults();
    };

    const clearSearchResults = () => {
        if (searchResults) searchResults.innerHTML = '';
        if (searchNotFound) searchNotFound.style.display = 'none';
    };

    const performSearch = (query) => {
        if (!query || query.trim().length < 2) { clearSearchResults(); return; }
        const normalizedQuery = query.toLowerCase().trim();
        const results = PRODUCTS_DATA.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
            const categoryMatch = product.category.toLowerCase().includes(normalizedQuery);
            const descriptionMatch = product.description.toLowerCase().includes(normalizedQuery);
            const markersMatch = product.ecoMarkers.some(marker => marker.toLowerCase().includes(normalizedQuery));
            return nameMatch || categoryMatch || descriptionMatch || markersMatch;
        });
        displaySearchResults(results, query);
    };

    const displaySearchResults = (results, query) => {
        if (!searchResults || !searchNotFound) return;
        if (results.length === 0) {
            searchResults.innerHTML = '';
            if (searchQueryText) searchQueryText.textContent = query;
            searchNotFound.style.display = 'block';
        } else {
            searchNotFound.style.display = 'none';
            const resultsHTML = results.map(product => {
                const ecoRatingCount = Math.min(product.ecoMarkers.length, 5);
                const ecoRating = '<i class="fas fa-leaf" style="color:var(--color-primary);margin-right:2px;"></i>'.repeat(ecoRatingCount);
                const categoryNames = { 'food': 'Продукты питания', 'cosmetics': 'Косметика', 'household': 'Бытовая химия', 'home': 'Товары для дома', 'clothes': 'Одежда' };
                return `<div class="search-result-item" data-product-id="${product.id}">
                    <div class="search-result-item__image">${product.image && (product.image.endsWith('.png') || product.image.endsWith('.jpg') || product.image.endsWith('.jpeg')) ? `<img src="images/${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : '<i class="fas fa-seedling" style="font-size:2rem;color:var(--color-primary);"></i>'}</div>
                    <div class="search-result-item__info">
                        <div class="search-result-item__name">${product.name}</div>
                        <div class="search-result-item__category">${categoryNames[product.category] || product.category}</div>
                        <div class="search-result-item__price">${product.price} руб. ПМР ПМР</div>
                    </div>
                    <div class="search-result-item__eco">${ecoRating}</div>
                </div>`;
            }).join('');
            searchResults.innerHTML = `<div class="search-modal__results-header"><span class="search-modal__results-count">Найдено: <span>${results.length}</span> товаров</span></div>${resultsHTML}`;
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productId = parseInt(item.dataset.productId);
                    closeSearch();
                    openQuickView(productId);
                });
            });
        }
    };

    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
    });

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { clearTimeout(searchTimeout); performSearch(searchInput.value); }
    });

    searchBtn?.addEventListener('click', openSearch);
    searchClose?.addEventListener('click', closeSearch);
    searchModal?.addEventListener('click', (e) => { if (e.target === searchModal) closeSearch(); });

    $$('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            if (searchInput) { searchInput.value = tag.textContent; searchInput.focus(); performSearch(tag.textContent); }
        });
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });
}

function initCart() {
    $('#cart-btn')?.addEventListener('click', openCart);
    $('#cart-close')?.addEventListener('click', closeCart);
    $('#cart-backdrop')?.addEventListener('click', closeCart);
    $('#continue-shopping')?.addEventListener('click', closeCart);
    $('#carbon-calculator-btn')?.addEventListener('click', () => { closeCart(); openCarbonModal(); });
    $('#checkout-btn')?.addEventListener('click', () => { closeCart(); openCheckoutModal(); });
    $('#apply-promo')?.addEventListener('click', applyPromoCode);
    updateCart();
}

function openCart() {
    $('#cart-sidebar')?.classList.add('cart--open');
    $('#cart-backdrop')?.classList.add('cart-backdrop--active');
    document.body.classList.add('no-scroll');
}

function closeCart() {
    $('#cart-sidebar')?.classList.remove('cart--open');
    $('#cart-backdrop')?.classList.remove('cart-backdrop--active');
    document.body.classList.remove('no-scroll');
}

function addToCart(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) { existingItem.quantity += 1; } else { cart.push({ ...product, quantity: 1 }); }
    updateCart();
    showToast('Товар добавлен!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCartQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) { removeFromCart(productId); } else { updateCart(); }
}

function applyPromoCode() {
    const input = $('#promo-input');
    const code = input?.value.trim().toUpperCase();
    if (code === 'ECO10' || code === 'ЗЕЛЕНЫЙ') {
        promoCode = { code, discount: 0.1 };
        showToast('Промокод применён! Скидка 10%');
        updateCart();
    } else { showToast('Промокод не найден'); }
}

function updateCart() {
    const cartItems = $('#cart-items');
    const cartFooter = $('#cart-footer');
    const cartCarbon = $('#cart-carbon');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if ($('#cart-count')) $('#cart-count').textContent = totalItems;
    if ($('#cart-badge')) $('#cart-badge').textContent = totalItems;
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `<div class="cart__empty"><div class="cart__empty-icon">🛒</div><p class="cart__empty-text">Корзина пуста</p><span class="cart__empty-hint">Добавьте товары для оформления заказа</span></div>`;
        if (cartFooter) cartFooter.style.display = 'none';
        if (cartCarbon) cartCarbon.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `<div class="cart__item" data-id="${item.id}">
            <div class="cart__item-image">${item.image && (item.image.endsWith('.png') || item.image.endsWith('.jpg') || item.image.endsWith('.jpeg')) ? `<img src="images/${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : item.emoji}</div>
            <div class="cart__item-info">
                <h4 class="cart__item-name">${item.name}</h4>
                <span class="cart__item-price">${formatPrice(item.price)} руб. ПМР ПМР</span>
                <span class="cart__item-carbon"><i class="fas fa-seedling"></i> ${calculateProductCarbon(item).toFixed(3)} кг CO₂</span>
                <div class="cart__item-quantity">
                    <button class="cart__item-qty-btn" onclick="updateCartQuantity(${item.id}, -1)" aria-label="Уменьшить">−</button>
                    <span class="cart__item-qty-value">${item.quantity}</span>
                    <button class="cart__item-qty-btn" onclick="updateCartQuantity(${item.id}, 1)" aria-label="Увеличить">+</button>
                </div>
            </div>
            <button class="cart__item-remove" onclick="removeFromCart(${item.id})" aria-label="Удалить">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>`).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = promoCode ? subtotal * promoCode.discount : 0;
        const deliveryPrice = DELIVERY_OPTIONS[deliveryMethod].price;
        const total = subtotal - discount + deliveryPrice;
        const totalCarbon = calculateTotalCarbon();
        const regularCarbon = totalCarbon / DELIVERY_OPTIONS[deliveryMethod].carbonCoef * 1.4;
        const savingsPercent = Math.round((1 - totalCarbon / regularCarbon) * 100);

        if ($('#cart-subtotal')) $('#cart-subtotal').textContent = `${formatPrice(subtotal)} руб. ПМР ПМР`;
        if ($('#cart-discount') && promoCode) { $('#cart-discount').textContent = `-${formatPrice(discount)} руб. ПМР ПМР`; $('#cart-discount-row').style.display = 'flex'; }
        if ($('#cart-total')) $('#cart-total').textContent = `${formatPrice(total)} руб. ПМР ПМР`;
        if ($('#cart-carbon-value')) $('#cart-carbon-value').textContent = `${totalCarbon.toFixed(2)} кг CO₂`;
        if ($('#cart-carbon-comparison')) { $('#cart-carbon-comparison').textContent = `Это на ${savingsPercent}% меньше обычной корзины!`; }
        if (subtotal < 200) {
            const remaining = 200 - subtotal;
            if ($('#cart-hint')) { $('#cart-hint').innerHTML = `💡 Закажите ещё на ${formatPrice(remaining)} руб. ПМР ПМР и получите бесплатную доставку велокурьером!`; $('#cart-hint').style.display = 'block'; }
        }
        if (cartFooter) cartFooter.style.display = 'block';
        if (cartCarbon) cartCarbon.style.display = 'flex';
    }
    localStorage.setItem('ecolife-cart', JSON.stringify(cart));
}

function calculateProductCarbon(product) {
    const weight = product.weight || 0.1;
    const productionCoef = product.productionCoef || 1.0;
    const distance = DELIVERY_DISTANCE[product.deliveryDistance] || 250;
    const packagingCarbon = PACKAGING_CARBON[product.packaging] || 0.2;
    return (weight * productionCoef) + (distance * 0.00021) + packagingCarbon;
}

function calculateTotalCarbon() {
    const deliveryCoef = DELIVERY_OPTIONS[deliveryMethod].carbonCoef;
    const itemsCarbon = cart.reduce((sum, item) => sum + (calculateProductCarbon(item) * item.quantity), 0);
    return itemsCarbon * deliveryCoef;
}

function getCarbonByCategory() {
    const categories = {};
    cart.forEach(item => {
        const cat = getCategoryName(item.category);
        const carbon = calculateProductCarbon(item) * item.quantity;
        categories[cat] = (categories[cat] || 0) + carbon;
    });
    return categories;
}

function initSlider() {
    const slides = $$('.slider__slide');
    const dots = $$('.slider__dot');
    const prevBtn = $('.slider__nav--prev');
    const nextBtn = $('.slider__nav--next');
    if (!slides.length) return;

    const showSlide = (index) => {
        slides.forEach((s, i) => s.classList.toggle('slider__slide--active', i === index));
        dots.forEach((d, i) => d.classList.toggle('slider__dot--active', i === index));
        currentSlide = index;
    };

    prevBtn?.addEventListener('click', () => { showSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1); });
    nextBtn?.addEventListener('click', () => { showSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
    setInterval(() => { showSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1); }, 5000);
}

function initProducts() { renderProducts(PRODUCTS_DATA); }

function renderProducts(products) {
    const grid = $('#products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <article class="product-card" data-category="${product.category}" data-markers="${product.ecoMarkers.join(',')}" data-aos="fade-up" itemscope itemtype="https://schema.org/Product">
            <meta itemprop="sku" content="ECO-${product.id}"><meta itemprop="productID" content="${product.id}">
            <div itemprop="brand" itemscope itemtype="https://schema.org/Brand" hidden><meta itemprop="name" content="${product.manufacturer.name}"></div>
            <div itemprop="manufacturer" itemscope itemtype="https://schema.org/Organization" hidden><meta itemprop="name" content="${product.manufacturer.name}"><div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress"><meta itemprop="addressCountry" content="${product.manufacturer.country}"></div></div>
            <div class="product-card__badges">${renderBadges(product)}</div>
            <div class="product-card__actions"><button class="product-card__action product-card__action--wishlist" aria-label="Добавить в избранное" type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button></div>
            <figure class="product-card__image">
                ${product.image && (product.image.endsWith('.png') || product.image.endsWith('.jpg') || product.image.endsWith('.jpeg')) ? `<img src="images/${product.image}" alt="${product.name}" class="product-card__img" loading="lazy">` : `<div class="product-card__placeholder" role="img" aria-label="${product.name}">${product.emoji}</div>`}
                <meta itemprop="image" content="https://aura-verde.ru/images/products/${product.image}">
                <button class="product-card__quick-view" data-id="${product.id}" aria-label="Быстрый просмотр товара ${product.name}" type="button">Быстрый просмотр</button>
            </figure>
            <div class="product-card__content">
                <span class="product-card__category" itemprop="category">${getCategoryName(product.category)}</span>
                <h3 class="product-card__title" itemprop="name">${product.name}</h3>
                <meta itemprop="description" content="${product.description.substring(0, 200)}">
                <div class="product-card__eco-rating"><div class="eco-rating" title="Эко-рейтинг: ${product.ecoMarkers.length}/6" role="img" aria-label="Эко-рейтинг ${product.ecoMarkers.length} из 6"><div class="eco-rating__leaves">${renderEcoLeaves(product.ecoMarkers.length)}</div></div><span class="product-card__carbon" title="Углеродный след товара"><i class="fas fa-seedling"></i> ${calculateProductCarbon(product).toFixed(2)} кг</span></div>
                <div class="product-card__markers" role="list" aria-label="Эко-маркеры">${renderEcoMarkers(product.ecoMarkers)}</div>
                <div class="product-card__rating" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating"><div class="product-card__stars" role="img" aria-label="Рейтинг ${product.rating} из 5">${renderStars(product.rating)}</div><span class="product-card__rating-count">(<span itemprop="reviewCount">${product.reviews}</span>)</span><meta itemprop="ratingValue" content="${product.rating}"><meta itemprop="bestRating" content="5"><meta itemprop="worstRating" content="1"></div>
                <button class="product-card__manufacturer-btn" data-product-id="${product.id}" type="button" title="О производителе">
                    <i class="fas fa-info-circle"></i> ${product.manufacturer.name}
                </button>
                <footer class="product-card__footer"><div class="product-card__price" itemprop="offers" itemscope itemtype="https://schema.org/Offer"><span class="product-card__price-current">${formatPrice(product.price)} руб. ПМР</span><meta itemprop="price" content="${product.price}"><meta itemprop="priceCurrency" content="RUB"><meta itemprop="availability" content="https://schema.org/InStock"><meta itemprop="itemCondition" content="https://schema.org/NewCondition"><link itemprop="url" href="https://aura-verde.ru/product/${product.id}"><div itemprop="seller" itemscope itemtype="https://schema.org/Organization" hidden><meta itemprop="name" content="Aura Verde"></div></div><button class="btn btn--cart" onclick="addToCart(${product.id})" aria-label="Добавить ${product.name} в корзину" type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></button></footer>
            </div>
        </article>
    `).join('');

    $$('.product-card__quick-view').forEach(btn => { btn.addEventListener('click', () => openQuickView(parseInt(btn.dataset.id))); });
    $$('.product-card__action--wishlist').forEach(btn => { btn.addEventListener('click', () => { btn.classList.toggle('active'); showToast(btn.classList.contains('active') ? 'Добавлено в избранное!' : 'Удалено из избранного'); }); });
    $$('.product-card__manufacturer-btn').forEach(btn => { 
        btn.addEventListener('click', (e) => { 
            e.stopPropagation();
            const productId = parseInt(btn.dataset.productId);
            const product = PRODUCTS_DATA.find(p => p.id === productId);
            if (product && product.manufacturer) {
                openManufacturerModal(product.manufacturer);
            }
        }); 
    });
    initAnimations();
}

function renderBadges(product) {
    const badges = [];
    if (product.ecoMarkers.includes('organic')) badges.push('<span class="product-card__badge product-card__badge--eco">Органик</span>');
    if (product.ecoMarkers.includes('local')) badges.push('<span class="product-card__badge product-card__badge--local">Местное</span>');
    if (product.ecoMarkers.includes('fairtrade')) badges.push('<span class="product-card__badge product-card__badge--fairtrade">Fair Trade</span>');
    return badges.slice(0, 2).join('');
}

function renderEcoMarkers(markers) {
    const markerIcons = { 
        organic: { icon: '<i class="fas fa-seedling"></i>', label: 'Органический' }, 
        vegan: { icon: '<i class="fas fa-leaf"></i>', label: 'Веганский' }, 
        fairtrade: { icon: '<i class="fas fa-handshake"></i>', label: 'Fair Trade' }, 
        plasticFree: { icon: '<i class="fas fa-ban"></i>', label: 'Без пластика' }, 
        local: { icon: '<i class="fas fa-map-marker-alt"></i>', label: 'Местное' }, 
        crueltyFree: { icon: '<i class="fas fa-paw"></i>', label: 'Cruelty-free' } 
    };
    return markers.slice(0, 4).map(m => { const marker = markerIcons[m]; return marker ? `<span class="eco-marker" title="${marker.label}">${marker.icon}</span>` : ''; }).join('');
}

function getCategoryName(category) {
    const categories = { food: 'Продукты', cosmetics: 'Косметика', household: 'Бытовая химия', home: 'Для дома', clothes: 'Одежда' };
    return categories[category] || category;
}

function renderEcoLeaves(count) {
    return Array(5).fill(0).map((_, i) => `<svg class="eco-rating__leaf ${i < Math.min(count, 5) ? 'eco-rating__leaf--filled' : ''}" viewBox="0 0 24 24" fill="currentColor"><path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/></svg>`).join('');
}

function renderStars(rating) {
    return Array(5).fill(0).map((_, i) => `<span class="product-card__star ${i < rating ? 'product-card__star--filled' : ''}">★</span>`).join('');
}

function initFilters() {
    $$('.filter__btn').forEach(btn => { btn.addEventListener('click', () => { $$('.filter__btn').forEach(b => b.classList.remove('filter__btn--active')); btn.classList.add('filter__btn--active'); applyFilters(); }); });
    $$('.filter__checkbox input').forEach(checkbox => { checkbox.addEventListener('change', applyFilters); });
    $('#sort-select')?.addEventListener('change', applyFilters);
}

function applyFilters() {
    const activeCategory = $('.filter__btn--active')?.dataset.category || $('.filter__btn--active')?.dataset.filter || 'all';
    const activeMarkers = [];
    $$('.filter__checkbox input:checked').forEach(cb => { activeMarkers.push(cb.value); });

    let filtered = PRODUCTS_DATA.filter(product => {
        const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
        const markersMatch = activeMarkers.length === 0 || activeMarkers.every(m => product.ecoMarkers.includes(m));
        return categoryMatch && markersMatch;
    });

    const sortBy = $('#sort-select')?.value || 'eco';
    if (sortBy === 'eco') filtered.sort((a, b) => b.ecoMarkers.length - a.ecoMarkers.length);
    else if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    renderProducts(filtered);
    const countEl = $('#products-count');
    if (countEl) countEl.textContent = `${filtered.length} товаров`;
}

function initModals() {
    $('#quick-view-backdrop')?.addEventListener('click', closeQuickView);
    $('#quick-view-close')?.addEventListener('click', closeQuickView);
    $('#quick-view-add-cart')?.addEventListener('click', () => { if (currentQuickViewProduct) { addToCart(currentQuickViewProduct.id); closeQuickView(); } });
    $('#show-manufacturer')?.addEventListener('click', () => { if (currentQuickViewProduct?.manufacturer) { openManufacturerModal(currentQuickViewProduct.manufacturer); } });
    $('#manufacturer-backdrop')?.addEventListener('click', closeManufacturerModal);
    $('#manufacturer-close')?.addEventListener('click', closeManufacturerModal);
    $('#carbon-backdrop')?.addEventListener('click', closeCarbonModal);
    $('#carbon-close')?.addEventListener('click', closeCarbonModal);
    $('#checkout-backdrop')?.addEventListener('click', closeCheckoutModal);
    $('#checkout-close')?.addEventListener('click', closeCheckoutModal);
    $('#success-backdrop')?.addEventListener('click', closeSuccessModal);
    $('#success-close-btn')?.addEventListener('click', closeSuccessModal);
    $('#continue-shopping-btn')?.addEventListener('click', () => { closeSuccessModal(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    $$('.checkout__delivery-option').forEach(option => {
        option.addEventListener('click', () => {
            $$('.checkout__delivery-option').forEach(o => o.classList.remove('checkout__delivery-option--selected'));
            option.classList.add('checkout__delivery-option--selected');
            option.querySelector('input').checked = true;
            deliveryMethod = option.querySelector('input').value;
            updateCheckoutSummary();
        });
    });

    $('#checkout-form')?.addEventListener('submit', (e) => { e.preventDefault(); if (validateCheckoutForm()) submitOrder(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeQuickView(); closeManufacturerModal(); closeCarbonModal(); closeCheckoutModal(); closeSuccessModal(); closeInfoModals(); } });
    
    document.querySelectorAll('[data-modal]').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const modalId = link.dataset.modal; openInfoModal(modalId); }); });
    document.querySelectorAll('.modal__content--info [data-close-modal]').forEach(el => { el.addEventListener('click', closeInfoModals); });
}

function openInfoModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) { modal.classList.add('modal--active'); document.body.classList.add('no-scroll'); }
}

function closeInfoModals() {
    document.querySelectorAll('.modal__content--info').forEach(content => { content.closest('.modal')?.classList.remove('modal--active'); });
    document.body.classList.remove('no-scroll');
}

function openQuickView(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;
    currentQuickViewProduct = product;
    const modal = $('#quick-view-modal');
    if (!modal) return;

    const imageContainer = $('#quick-view-image');
    if (product.image && (product.image.endsWith('.png') || product.image.endsWith('.jpg') || product.image.endsWith('.jpeg'))) {
        imageContainer.innerHTML = `<img src="images/${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-lg);">`;
    } else { imageContainer.textContent = product.emoji; }
    
    $('#quick-view-category').textContent = getCategoryName(product.category);
    $('#quick-view-title').textContent = product.name;
    $('#quick-view-price').textContent = `${formatPrice(product.price)} руб. ПМР`;
    $('#quick-view-description').textContent = product.description;
    $('#quick-view-eco-rating').innerHTML = `<div class="eco-rating__leaves">${renderEcoLeaves(product.ecoMarkers.length)}</div><span class="eco-rating__value">${product.ecoMarkers.length}/6 критериев</span>`;
    
    // Render certificate icons
    const certImagesContainer = $('#quick-view-cert-icons');
    if (certImagesContainer && product.certImages && product.certImages.length > 0) {
        certImagesContainer.innerHTML = product.certImages.map(certFile => {
            const label = (window.CERT_LABELS && window.CERT_LABELS[certFile]) || certFile.replace('.svg', '');
            return `<div class="modal__cert-item">
                <img src="images/certificates/${certFile}" alt="${label}" class="modal__cert-icon">
                <span class="modal__cert-label">${label}</span>
            </div>`;
        }).join('');
        certImagesContainer.style.display = 'flex';
    } else if (certImagesContainer) {
        certImagesContainer.style.display = 'none';
    }
    
    $('#quick-view-certificates').innerHTML = product.certificates.map(cert => `<span class="modal__product-certificate"><i class="fas fa-check"></i> ${cert}</span>`).join('');
    $('#quick-view-markers').innerHTML = product.ecoMarkers.map(m => { const labels = { organic: 'Органический', vegan: 'Веганский', fairtrade: 'Fair Trade', plasticFree: 'Без пластика', local: 'Местное производство', crueltyFree: 'Не тестируется на животных' }; return `<span class="modal__product-marker"><i class="fas fa-check"></i> ${labels[m] || m}</span>`; }).join('');
    $('#quick-view-manufacturer-name').textContent = product.manufacturer.name;
    $('#quick-view-manufacturer-country').textContent = product.manufacturer.country;
    $('#quick-view-carbon').textContent = `${calculateProductCarbon(product).toFixed(3)} кг CO₂`;
    modal.classList.add('modal--active');
    document.body.classList.add('no-scroll');
}

function closeQuickView() { $('#quick-view-modal')?.classList.remove('modal--active'); document.body.classList.remove('no-scroll'); currentQuickViewProduct = null; }

function openManufacturerModal(manufacturer) {
    currentManufacturer = manufacturer;
    const modal = $('#manufacturer-modal');
    if (!modal) return;
    
    // Update manufacturer logo
    const logoContainer = $('.modal__manufacturer-logo');
    if (logoContainer && manufacturer.logo) {
        const logoUrl = window.BRAND_LOGOS && window.BRAND_LOGOS[manufacturer.logo];
        if (logoUrl) {
            logoContainer.innerHTML = `<img src="${logoUrl}" alt="${manufacturer.name}" style="width:100%;height:100%;object-fit:contain;padding:8px;" onerror="this.parentElement.innerHTML='🌿'">`;
        } else {
            logoContainer.innerHTML = '🌿';
        }
    }
    
    $('#manufacturer-name').textContent = manufacturer.name;
    $('#manufacturer-country').textContent = manufacturer.country;
    $('#manufacturer-description').textContent = manufacturer.description;
    $('#manufacturer-practices').innerHTML = manufacturer.practices.map(p => `<li><i class="fas fa-check"></i> ${p}</li>`).join('');
    $('#manufacturer-website').href = manufacturer.website;
    closeQuickView();
    modal.classList.add('modal--active');
    document.body.classList.add('no-scroll');
}

function closeManufacturerModal() { $('#manufacturer-modal')?.classList.remove('modal--active'); document.body.classList.remove('no-scroll'); }

function openCarbonModal() { if (cart.length === 0) { showToast('Корзина пуста'); return; } $('#carbon-modal')?.classList.add('modal--active'); document.body.classList.add('no-scroll'); renderCarbonChart(); }

function closeCarbonModal() { $('#carbon-modal')?.classList.remove('modal--active'); document.body.classList.remove('no-scroll'); }

function renderCarbonChart() {
    const ctx = $('#carbon-chart')?.getContext('2d');
    if (!ctx || cart.length === 0) return;

    let productionCarbon = 0, transportCarbon = 0, packagingCarbon = 0;
    cart.forEach(item => {
        const weight = item.weight || 0.1;
        const distance = DELIVERY_DISTANCE[item.deliveryDistance] || 250;
        productionCarbon += (weight * item.productionCoef) * item.quantity;
        transportCarbon += (distance * 0.00021) * item.quantity;
        packagingCarbon += PACKAGING_CARBON[item.packaging] * item.quantity;
    });

    const totalCarbon = (productionCarbon + transportCarbon + packagingCarbon) * DELIVERY_OPTIONS[deliveryMethod].carbonCoef;
    const regularCarbon = totalCarbon / DELIVERY_OPTIONS[deliveryMethod].carbonCoef * 1.4;

    if (carbonChart) carbonChart.destroy();
    carbonChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Производство', 'Транспорт', 'Упаковка'], datasets: [{ data: [productionCarbon, transportCarbon, packagingCarbon], backgroundColor: ['#2E7D32', '#66BB6A', '#5D4037'], borderWidth: 0 }] }, options: { cutout: '65%', plugins: { legend: { display: false } } } });

    $('#carbon-total').textContent = `${totalCarbon.toFixed(2)} кг CO₂`;
    $('#eco-value').textContent = `${totalCarbon.toFixed(2)} кг`;
    $('#eco-bar').style.width = `${Math.min((totalCarbon / regularCarbon) * 100, 100)}%`;
    $('#regular-value').textContent = `${regularCarbon.toFixed(2)} кг`;
    $('#carbon-savings').textContent = `${(regularCarbon - totalCarbon).toFixed(2)} кг CO₂`;
    const savingsPercent = Math.round((1 - totalCarbon / regularCarbon) * 100);
    $('#savings-percent').textContent = `${savingsPercent}%`;

    $('#carbon-legend').innerHTML = `<div class="carbon-chart__legend-item"><span class="carbon-chart__legend-color" style="background: #2E7D32"></span><div class="carbon-chart__legend-info"><span class="carbon-chart__legend-label">Производство</span><span class="carbon-chart__legend-value">${productionCarbon.toFixed(2)} кг (${Math.round(productionCarbon/totalCarbon*100)}%)</span></div></div><div class="carbon-chart__legend-item"><span class="carbon-chart__legend-color" style="background: #66BB6A"></span><div class="carbon-chart__legend-info"><span class="carbon-chart__legend-label">Транспорт</span><span class="carbon-chart__legend-value">${transportCarbon.toFixed(2)} кг (${Math.round(transportCarbon/totalCarbon*100)}%)</span></div></div><div class="carbon-chart__legend-item"><span class="carbon-chart__legend-color" style="background: #5D4037"></span><div class="carbon-chart__legend-info"><span class="carbon-chart__legend-label">Упаковка</span><span class="carbon-chart__legend-value">${packagingCarbon.toFixed(2)} кг (${Math.round(packagingCarbon/totalCarbon*100)}%)</span></div></div>`;

    const tips = [];
    if (cart.some(i => i.deliveryDistance === 'far')) tips.push('<i class="fas fa-globe-europe"></i> Выбирайте местные товары для снижения транспортного следа');
    if (cart.some(i => i.packaging === 'plastic' || i.packaging === 'glass')) tips.push('<i class="fas fa-box"></i> Отдавайте предпочтение товарам без упаковки или в бумаге');
    if (deliveryMethod !== 'bike') tips.push('<i class="fas fa-bicycle"></i> Используйте велокурьера для экономии 5% CO₂');
    $('#carbon-tips').innerHTML = tips.map(t => `<li>${t}</li>`).join('');
}

function openCheckoutModal() { if (cart.length === 0) { showToast('Корзина пуста!'); return; } $('#checkout-modal')?.classList.add('modal--active'); document.body.classList.add('no-scroll'); updateCheckoutSummary(); }

function closeCheckoutModal() { $('#checkout-modal')?.classList.remove('modal--active'); document.body.classList.remove('no-scroll'); }

function updateCheckoutSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = promoCode ? subtotal * promoCode.discount : 0;
    const deliveryPrice = DELIVERY_OPTIONS[deliveryMethod].price;
    const total = subtotal - discount + deliveryPrice;
    const totalCarbon = calculateTotalCarbon();

    $('#checkout-items').innerHTML = cart.map(item => `<div class="checkout__summary-item"><div class="checkout__summary-item-image">${item.image && (item.image.endsWith('.png') || item.image.endsWith('.jpg') || item.image.endsWith('.jpeg')) ? `<img src="images/${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">` : item.emoji}</div><div class="checkout__summary-item-info"><span class="checkout__summary-item-name">${item.name}</span><span class="checkout__summary-item-qty">× ${item.quantity}</span></div><span class="checkout__summary-item-price">${formatPrice(item.price * item.quantity)} руб. ПМР</span></div>`).join('');
    $('#checkout-subtotal').textContent = `${formatPrice(subtotal)} руб. ПМР`;
    if (promoCode && $('#checkout-discount-row')) { $('#checkout-discount').textContent = `-${formatPrice(discount)} руб. ПМР`; $('#checkout-discount-row').style.display = 'flex'; }
    $('#checkout-delivery').textContent = deliveryPrice ? `${formatPrice(deliveryPrice)} руб. ПМР` : 'Бесплатно';
    $('#checkout-total').textContent = `${formatPrice(total)} руб. ПМР`;
    $('#checkout-carbon').textContent = `${totalCarbon.toFixed(2)} кг CO₂`;
}

function validateCheckoutForm() {
    const form = $('#checkout-form');
    const name = form?.querySelector('[name="name"]');
    const email = form?.querySelector('[name="email"]');
    const phone = form?.querySelector('[name="phone"]');
    const address = form?.querySelector('[name="address"]');
    let valid = true;
    $$('.checkout__error').forEach(el => el.textContent = '');
    $$('.checkout__input--error').forEach(el => el.classList.remove('checkout__input--error'));
    if (!name?.value.trim()) { showFieldError(name, 'Введите имя'); valid = false; }
    if (!email?.value.trim() || !isValidEmail(email.value)) { showFieldError(email, 'Введите корректный email'); valid = false; }
    if (!phone?.value.trim()) { showFieldError(phone, 'Введите телефон'); valid = false; }
    if (!address?.value.trim()) { showFieldError(address, 'Введите адрес доставки'); valid = false; }
    return valid;
}

function showFieldError(field, message) { if (!field) return; field.classList.add('checkout__input--error'); const errorEl = field.parentElement?.querySelector('.checkout__error'); if (errorEl) errorEl.textContent = message; }

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function submitOrder() {
    const orderNumber = 'ECO-' + Math.floor(10000 + Math.random() * 90000);
    const totalCarbon = calculateTotalCarbon();
    const savedCarbon = (totalCarbon / DELIVERY_OPTIONS[deliveryMethod].carbonCoef * 1.4) - totalCarbon;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = promoCode ? total * promoCode.discount : 0;
    const finalTotal = total - discount + DELIVERY_OPTIONS[deliveryMethod].price;
    
    // Add CO2 savings to global counter (API + localStorage)
    if (savedCarbon > 0) {
        addToGlobalCO2(savedCarbon, orderNumber);
    }
    
    $('#order-number').textContent = orderNumber;
    $('#order-total').textContent = `${formatPrice(finalTotal)} руб. ПМР`;
    $('#order-carbon').textContent = `${totalCarbon.toFixed(2)} кг CO₂`;
    $('#saved-carbon').textContent = `${savedCarbon.toFixed(2)} кг CO₂`;
    closeCheckoutModal();
    $('#success-modal')?.classList.add('modal--active');
    cart = [];
    promoCode = null;
    deliveryMethod = 'bike';
    updateCart();
    localStorage.removeItem('ecolife-cart');
}

function closeSuccessModal() { $('#success-modal')?.classList.remove('modal--active'); document.body.classList.remove('no-scroll'); }

function initForms() {
    $('#contact-form')?.addEventListener('submit', (e) => { 
        e.preventDefault(); 
        showSuccessModal('Сообщение отправлено!', 'Мы получили ваше сообщение и свяжемся с вами в ближайшее время.'); 
        e.target.reset(); 
    });
    $('#newsletter-form')?.addEventListener('submit', (e) => { 
        e.preventDefault(); 
        showSuccessModal('Вы подписаны!', 'Спасибо за подписку на нашу эко-рассылку! Скидка 10% отправлена на ваш email.'); 
        e.target.reset(); 
    });
}

// Success Modal Functions
function showSuccessModal(title, message) {
    // Check if modal exists, if not create it
    let modal = $('#success-modal');
    if (!modal) {
        createSuccessModal();
        modal = $('#success-modal');
    }
    
    const modalTitle = modal.querySelector('.success-modal__title');
    const modalText = modal.querySelector('.success-modal__text');
    
    if (modalTitle) modalTitle.textContent = title || 'Успех!';
    if (modalText) modalText.textContent = message || 'Операция выполнена успешно.';
    
    modal.classList.add('success-modal--active');
    document.body.classList.add('no-scroll');
}

function closeSuccessModal() {
    const modal = $('#success-modal');
    if (modal) {
        modal.classList.remove('success-modal--active');
        document.body.classList.remove('no-scroll');
    }
}

function createSuccessModal() {
    const modalHTML = `
        <div class="success-modal" id="success-modal">
            <div class="success-modal__backdrop" onclick="closeSuccessModal()"></div>
            <div class="success-modal__content">
                <div class="success-modal__icon">
                    <i class="fas fa-check"></i>
                </div>
                <h2 class="success-modal__title">Успех!</h2>
                <p class="success-modal__text">Операция выполнена успешно.</p>
                <button class="success-modal__btn" onclick="closeSuccessModal()">OK</button>
            </div>
        </div>
        <style>
            .success-modal {
                display: none;
                position: fixed;
                inset: 0;
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            .success-modal--active {
                display: flex;
            }
            .success-modal__backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
            }
            .success-modal__content {
                position: relative;
                background: white;
                border-radius: 24px;
                padding: 50px 40px;
                max-width: 450px;
                width: 90%;
                text-align: center;
                box-shadow: 0 30px 100px rgba(0,0,0,0.3);
                animation: successModalSlideIn 0.3s ease;
            }
            @keyframes successModalSlideIn {
                from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .success-modal__icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #43A047, #66BB6A);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 25px;
                font-size: 2.5rem;
                color: white;
            }
            .success-modal__title {
                font-family: var(--font-heading, 'Montserrat', sans-serif);
                font-size: 2rem;
                font-weight: 700;
                color: #2E7D32;
                margin-bottom: 15px;
            }
            .success-modal__text {
                font-size: 1.1rem;
                color: #757575;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .success-modal__btn {
                padding: 14px 40px;
                background: linear-gradient(135deg, #43A047, #66BB6A);
                color: white;
                border: none;
                border-radius: 50px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .success-modal__btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(67, 160, 71, 0.4);
            }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add escape key listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSuccessModal();
    });
}

// Make functions globally available
window.showSuccessModal = showSuccessModal;
window.closeSuccessModal = closeSuccessModal;

const BLOG_IMAGES = { 1: '<i class="fas fa-utensils"></i>', 2: '<i class="fas fa-handshake"></i>', 3: '<i class="fas fa-leaf"></i>', 4: '<i class="fas fa-recycle"></i>', 5: '<i class="fas fa-tag"></i>', 6: '<i class="fas fa-box"></i>', 7: '<i class="fas fa-magic"></i>' };

function initBlog() {
    document.querySelectorAll('.blog-card__link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const articleId = parseInt(link.dataset.id);
            if (typeof BLOG_DATA !== 'undefined' && BLOG_DATA && Array.isArray(BLOG_DATA)) {
                const article = BLOG_DATA.find(a => a.id === articleId);
                if (article) openArticleModal(article);
            }
        });
    });
}

function openArticleModal(article) {
    const modal = $('#article-modal');
    if (!modal) return;
    const articleImage = $('#article-image');
    if (articleImage && article.image) { const img = articleImage.querySelector('img'); if (img) { img.src = `images/${article.image}`; img.alt = article.title; } articleImage.style.display = 'block'; } else if (articleImage) { articleImage.style.display = 'none'; }
    $('#article-title').textContent = article.title;
    $('#article-date').textContent = formatDate(article.date);
    $('#article-category').textContent = article.category;
    $('#article-content').innerHTML = article.content;
    $('#article-tags').innerHTML = article.tags.map(t => `<span class="tag">#${t}</span>`).join('');
    modal.classList.add('modal--active');
    document.body.classList.add('no-scroll');
}

function closeArticleModal() {
    const modal = $('#article-modal');
    if (modal) {
        modal.classList.remove('modal--active');
        document.body.classList.remove('no-scroll');
    }
}

function initArticleModal() {
    const closeBtn = $('#article-modal-close');
    const backdrop = $('#article-modal .modal__backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeArticleModal);
    if (backdrop) backdrop.addEventListener('click', closeArticleModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeArticleModal(); });
}

function formatDate(dateStr) { const date = new Date(dateStr); return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const i = [...(e.target.parentElement?.children || [])].indexOf(e.target);
                setTimeout(() => e.target.classList.add('animate-in', 'aos-animate'), i * 30);
                observer.unobserve(e.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.05 });
    $$('[data-aos],.section__header,.blog-card,.product-card,.feature,.review-card,.testimonial-card,.category-card,.eco-counter,.about-story,.about-mission,.contact-form,.contact-info,.contact__info,.footer__column,.hero__content,.hero__slider,.leaf-divider,.newsletter,.filter').forEach(el => observer.observe(el));
}

function initBackToTop() {
    const btn = $('#back-to-top');
    window.addEventListener('scroll', () => { btn?.classList.toggle('back-to-top--visible', window.scrollY > 500); });
    btn?.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// ============================================================================
// GLOBAL CO2 COUNTER - Tracks total CO2 saved across all orders
// Uses localStorage (API disabled for file:// protocol)
// ============================================================================

const CO2_API_URL = '/api/co2';
const GLOBAL_CO2_KEY = 'globalCO2Saved';
const INITIAL_CO2 = 2543;

// Check if running on file:// protocol (no API available)
const isFileProtocol = window.location.protocol === 'file:';

// Current CO2 value (cached)
let currentCO2Value = INITIAL_CO2;

/**
 * Format number with space as thousands separator
 */
function formatNumberWithSpaces(num, decimals = 0) {
    const fixed = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

/**
 * Animate counter from start to end value
 */
function animateCounter(element, start, end, duration = 1500) {
    if (!element) return;
    const startTime = performance.now();
    const difference = end - start;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(start + difference * easeOut);
        element.textContent = formatNumberWithSpaces(currentValue);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/**
 * Update CO2 display element
 */
function updateCO2Display(value, animate = false) {
    const counter = document.getElementById('total-co2-saved');
    if (!counter) return;
    
    const newValue = Math.round(value);
    
    if (animate) {
        const oldValue = parseInt(counter.dataset.count) || currentCO2Value;
        counter.setAttribute('data-count', newValue);
        counter.classList.add('updating');
        animateCounter(counter, oldValue, newValue, 1500);
        setTimeout(() => counter.classList.remove('updating'), 1500);
    } else {
        counter.setAttribute('data-count', newValue);
        counter.textContent = formatNumberWithSpaces(newValue);
    }
    currentCO2Value = value;
}

/**
 * Get current global CO2 from API or localStorage
 */
async function getGlobalCO2() {
    // Skip API call if running on file:// protocol
    if (!isFileProtocol) {
        try {
            const response = await fetch(CO2_API_URL);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    currentCO2Value = data.data.totalCO2Saved;
                    localStorage.setItem(GLOBAL_CO2_KEY, currentCO2Value.toString());
                    return currentCO2Value;
                }
            }
        } catch (error) {
            // Silent fail - use localStorage
        }
    }
    
    // Use localStorage
    const saved = localStorage.getItem(GLOBAL_CO2_KEY);
    if (saved !== null && !isNaN(parseFloat(saved))) {
        currentCO2Value = parseFloat(saved);
        return currentCO2Value;
    }
    return INITIAL_CO2;
}

/**
 * Initialize global CO2 counter on page load
 */
async function initGlobalCO2() {
    const value = await getGlobalCO2();
    updateCO2Display(value, false);
    
    // Update other eco-stats counters
    document.querySelectorAll('.eco-stats__number[data-count]').forEach(counter => {
        if (counter.id === 'total-co2-saved') return;
        const target = parseInt(counter.dataset.count) || 0;
        counter.textContent = formatNumberWithSpaces(target);
    });
}

/**
 * Add CO2 savings after successful order
 */
async function addToGlobalCO2(savedAmount, orderId = null) {
    const previousTotal = currentCO2Value;
    
    // Try API only if not on file:// protocol
    if (!isFileProtocol) {
        try {
            const response = await fetch(`${CO2_API_URL}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: savedAmount, orderId })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const newTotal = data.data.newTotal;
                    localStorage.setItem(GLOBAL_CO2_KEY, newTotal.toString());
                    updateCO2Display(newTotal, true);
                    return newTotal;
                }
            }
        } catch (error) {
            // Silent fail - use localStorage
        }
    }
    
    // Save to localStorage
    const newTotal = previousTotal + savedAmount;
    localStorage.setItem(GLOBAL_CO2_KEY, newTotal.toString());
    updateCO2Display(newTotal, true);
    return newTotal;
}

/**
 * Reset CO2 counter to initial value
 */
async function resetGlobalCO2() {
    if (!isFileProtocol) {
        try {
            await fetch(`${CO2_API_URL}/reset`, { method: 'POST' });
        } catch (error) {
            // Silent fail
        }
    }
    localStorage.setItem(GLOBAL_CO2_KEY, INITIAL_CO2.toString());
    updateCO2Display(INITIAL_CO2, false);
}

// Legacy function wrapper
function initCO2Counter() { initGlobalCO2(); }

// Export functions globally
window.addToGlobalCO2 = addToGlobalCO2;
window.getGlobalCO2 = getGlobalCO2;
window.resetGlobalCO2 = resetGlobalCO2;
window.formatNumberWithSpaces = formatNumberWithSpaces;
window.animateCounter = animateCounter;

// Legacy aliases for compatibility
function addCO2Saved(amount) { return addToGlobalCO2(amount); }
function getTotalCO2Saved() { return getGlobalCO2(); }
function addCO2Savings(carbonSaved) { return addToGlobalCO2(carbonSaved); }
function resetCO2Counter() { resetGlobalCO2(); }
function animateValue(el, start, end, dur) { animateCounter(el, start, end, dur); }
function formatNumber(num) { return formatNumberWithSpaces(num); }

// Export legacy functions
window.addCO2Saved = addCO2Saved;
window.addCO2Savings = addCO2Savings;
window.getTotalCO2Saved = getTotalCO2Saved;
window.resetCO2Counter = resetCO2Counter;
window.animateValue = animateValue;
window.formatNumber = formatNumber;

function showToast(message, type = 'success') {
    const toast = $('#toast');
    if (!toast) return;
    toast.className = `toast toast--${type}`;
    $('#toast-message').textContent = message;
    toast.classList.add('toast--visible');
    setTimeout(() => toast.classList.remove('toast--visible'), 3000);
}

function formatPrice(price) { return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
