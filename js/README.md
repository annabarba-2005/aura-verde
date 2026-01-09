# JavaScript Architecture

## Описание

JavaScript-код проекта организован по модульному принципу с учётом БЭМ-методологии для связи с CSS-компонентами.

## Структура файлов

```
js/
├── app.js                      # Главный файл приложения
└── data/
    └── products.js             # Данные о продуктах
```

## Модули в app.js

### Инициализация
```javascript
// Основная функция инициализации
function init() {
    initPreloader();
    initNavigation();
    initSlider();
    initFilters();
    initCatalog();
    initCart();
    initCheckout();
    initModals();
    initSearch();
    initAnimations();
    initBlog();
}
```

### Описание модулей

| Модуль | Функция | Описание |
|--------|---------|----------|
| Preloader | `initPreloader()` | Анимация загрузки страницы |
| Navigation | `initNavigation()` | Навигация и меню |
| Slider | `initSlider()` | Hero-слайдер |
| Filters | `initFilters()` | Фильтрация товаров |
| Catalog | `initCatalog()` | Отрисовка каталога |
| Cart | `initCart()` | Работа с корзиной |
| Checkout | `initCheckout()` | Оформление заказа |
| Modals | `initModals()` | Модальные окна |
| Search | `initSearch()` | Поиск по товарам |
| Animations | `initAnimations()` | Scroll-анимации |
| Blog | `initBlog()` | Блог и статьи |

## Данные

### products.js

Массив товаров с экологической информацией:

```javascript
const products = [
    {
        id: 1,
        name: 'Название товара',
        price: 1990,
        category: 'food',
        ecoRating: 5,
        carbonFootprint: 0.5,
        certificates: ['Organic', 'Non-GMO'],
        manufacturer: { /* ... */ }
    }
];
```

### Категории товаров

| ID | Название |
|----|----------|
| `food` | Продукты питания |
| `cosmetics` | Косметика |
| `household` | Бытовая химия |
| `home` | Для дома |
| `clothes` | Одежда |

## События

### Корзина
```javascript
// Добавление товара
addToCart(productId);

// Обновление корзины
updateCartUI();

// Открытие корзины
openCart();
```

### Модальные окна
```javascript
// Быстрый просмотр товара
openQuickView(productId);

// Информация о производителе
openManufacturer(productId);
```

### Фильтры
```javascript
// Фильтрация по категории
filterProducts(category);

// Сортировка
sortProducts(sortBy);
```

## Local Storage

### Корзина
```javascript
// Ключ хранения
localStorage.getItem('ecolife-cart');
localStorage.setItem('ecolife-cart', JSON.stringify(cart));
```

## Анимации

Используется Intersection Observer для scroll-анимаций:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, {
    rootMargin: '-100px',
    threshold: 0.05
});
```

## Связь с CSS

JavaScript манипулирует CSS-классами по БЭМ:

```javascript
// Добавление модификатора
element.classList.add('modal--active');

// Удаление модификатора
element.classList.remove('header--scrolled');

// Переключение
element.classList.toggle('menu--open');
```

