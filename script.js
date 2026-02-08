/**
 * Main JavaScript File
 * Handles interactive functionality only - no DOM creation
 */

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Show a notification message to the user
 */
function showNotification(message, duration = 2500) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ===================================
// SLIDESHOW FUNCTIONALITY
// ===================================

function initializeSlideshow(card) {
    const slides = card.querySelectorAll('.slides img');
    const dots = card.querySelectorAll('.dot');

    if (slides.length === 0 || dots.length === 0) return;

    let currentSlide = 0;
    let autoSlideInterval;

    function goToSlide(index) {
        // Remove all active and prev classes
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Add prev class to previous slide
        if (currentSlide !== index) {
            slides[currentSlide].classList.add('prev');
        }

        // Update current slide index
        currentSlide = index;

        // Add active class to current slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex);
    }

    // Auto-slide on hover
    card.addEventListener('mouseenter', () => {
        if (slides.length > 1) {
            autoSlideInterval = setInterval(nextSlide, 2000);
        }
    });

    card.addEventListener('mouseleave', () => {
        clearInterval(autoSlideInterval);
        goToSlide(0); // Reset to first slide
    });

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearInterval(autoSlideInterval);
            goToSlide(index);
        });
    });

    // Initialize first slide as active
    goToSlide(0);
}

// ===================================
// CART STATE MANAGEMENT (ADD THIS)
// ===================================

let cart = [];

// Load cart from localStorage on page load
function loadCart() {
    const savedCart = localStorage.getItem('vyndetta_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
    updateCartBadge();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('vyndetta_cart', JSON.stringify(cart));
}

// ===================================
// CART FUNCTIONALITY (ADD THIS)
// ===================================

/**
 * Add item to cart
 */
function addToCart(product) {
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification('Quantity updated in cart!');
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        showNotification('Added to cart!');
    }
    
    saveCart();
    updateCartDisplay();
    updateCartBadge();
    openCart();
}

/**
 * Remove item from cart
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartBadge();
    showNotification('Item removed from cart');
}

/**
 * Update item quantity
 */
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        // Remove item if quantity is 0
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        saveCart();
        updateCartDisplay();
        updateCartBadge();
    }
}

/**
 * Calculate cart total
 */
function calculateTotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

/**
 * Get total item count
 */
function getTotalItems() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// ===================================
// CART UI UPDATES (ADD THIS)
// ===================================

/**
 * Update cart display
 */
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-qty" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-qty" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                updateQuantity(id, 1);
            });
        });
        
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                updateQuantity(id, -1);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                removeFromCart(id);
            });
        });
    }
    
    // Update totals
    const total = calculateTotal();
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl) {
        subtotalEl.textContent = `$${total.toFixed(2)}`;
    }
    if (totalEl) {
        totalEl.textContent = `$${total.toFixed(2)}`;
    }
}

/**
 * Update cart badge count
 */
function updateCartBadge() {
    const totalItems = getTotalItems();
    let badge = document.querySelector('.cart-badge');
    
    if (totalItems > 0) {
        if (!badge) {
            // Create badge if it doesn't exist
            const cartLink = document.querySelector('a[href="#Cart"]');
            if (cartLink) {
                cartLink.style.position = 'relative';
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                cartLink.appendChild(badge);
            }
        }
        if (badge) {
            badge.textContent = totalItems;
        }
    } else {
        if (badge) {
            badge.remove();
        }
    }
}

// ===================================
// CART OPEN/CLOSE (ADD THIS)
// ===================================

function openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// ===================================
// ADD TO CART FROM PRODUCT CARDS (ADD THIS)
// ===================================

/**
 * Setup "Add to Cart" buttons on product cards
 */
function setupAddToCartButtons() {
    // Get all shopping cart icons in product cards
    const cartIcons = document.querySelectorAll('.icons .fa-shopping-cart');
    
    cartIcons.forEach((icon, index) => {
        icon.parentElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Get product info from the card
            const card = icon.closest('.card-gallery');
            const titleEl = card.querySelector('.product-title');
            const priceEl = card.querySelector('.product-price');
            const imageEl = card.querySelector('.slides img.active') || card.querySelector('.slides img');
            
            // Extract data
            const title = titleEl ? titleEl.textContent.trim() : 'Product';
            const priceText = priceEl ? priceEl.textContent : '$9.00';
            const price = parseFloat(priceText.replace('$', '').replace(' USD', '').trim());
            const image = imageEl ? imageEl.src : '';
            
            // Create product object with unique ID
            const product = {
                id: Date.now() + index, // More unique ID
                title: title,
                price: price,
                image: image
            };
            
            addToCart(product);
        });
    });
}

// ===================================
// KEEP YOUR EXISTING showNotification FUNCTION
// OR UPDATE IT WITH THIS VERSION:
// ===================================

/**
 * Show a notification message to the user
 */
function showNotification(message, duration = 2500) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}






// ===================================
// ADD TO CART FROM PRODUCT CARDS (ADD THIS)
// ===================================

/**
 * Setup "Add to Cart" buttons on product cards
 */
function setupAddToCartButtons() {
    // Get all shopping cart icons in product cards
    const cartIcons = document.querySelectorAll('.icons .fa-shopping-cart');
    
    cartIcons.forEach((icon, index) => {
        icon.parentElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Get product info from the card
            const card = icon.closest('.card-gallery');
            const titleEl = card.querySelector('.product-title');
            const priceEl = card.querySelector('.product-price');
            const imageEl = card.querySelector('.slides img.active') || card.querySelector('.slides img');
            
            // Extract data
            const title = titleEl ? titleEl.textContent.trim() : 'Product';
            const priceText = priceEl ? priceEl.textContent : '$9.00';
            const price = parseFloat(priceText.replace('$', '').replace(' USD', '').trim());
            const image = imageEl ? imageEl.src : '';
            
            // Create product object with unique ID
            const product = {
                id: Date.now() + index, // More unique ID
                title: title,
                price: price,
                image: image
            };
            
            addToCart(product);
        });
    });
}
// ===================================
// LIKES MANAGEMENT
// ===================================
// (You can fill this in later)


// ===================================
// CART MANAGEMENT
// ===================================
// (You can fill this in later)


// ===================================
// INITIALIZATION
// ===================================

function init() {
    const cards = document.querySelectorAll('.card-gallery');

    cards.forEach(card => {
        initializeSlideshow(card);
    });


    // ADD THESE CART EVENT LISTENERS:
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const cartLink = document.querySelector('a[href="#Cart"]');
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', closeCart);
    }
    
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }
    
    // ADD THESE CART INITIALIZATION CALLS:
    setupAddToCartButtons();
    loadCart();

    console.log('Initialized', cards.length, 'product cards');
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);