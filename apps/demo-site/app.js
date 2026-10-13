// Demo Store Dynamic Cart & Interactivity Handlers
const CART_STORAGE_KEY = 'cf_demo_cart_items';

const CATALOG = {
  'aurora-headphones': {
    id: 'aurora-headphones',
    name: 'Aurora Pro ANC Headphones',
    price: 299,
    icon: '🎧',
    color: 'Matte Black'
  },
  'zenith-smartwatch': {
    id: 'zenith-smartwatch',
    name: 'Zenith Bio Watch Ultra',
    price: 399,
    icon: '⌚',
    color: 'Titanium Grey'
  },
  'nebula-earbuds': {
    id: 'nebula-earbuds',
    name: 'Nebula True Wireless Earbuds',
    price: 149,
    icon: '🎶',
    color: 'Obsidian'
  },
  'pulse-speaker': {
    id: 'pulse-speaker',
    name: 'Pulse Dynamic 360 Speaker',
    price: 179,
    icon: '🔊',
    color: 'Ocean Blue'
  },
  'hyper-dock': {
    id: 'hyper-dock',
    name: 'HyperCharge 140W GaN Station',
    price: 89,
    icon: '⚡',
    color: 'Space Grey'
  },
  'lumina-light': {
    id: 'lumina-light',
    name: 'Lumina Smart Desk Ambient Light',
    price: 119,
    icon: '💡',
    color: 'Pure White'
  }
};

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  // Default initial cart item if completely fresh
  const defaultItem = [{ ...CATALOG['aurora-headphones'], quantity: 1 }];
  saveCart(defaultItem);
  return defaultItem;
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {}
  updateCartBadge();
}

function getCartCount() {
  const items = getCart();
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.innerText = getCartCount();
  }
}

function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

function addToCart(productKeyOrName) {
  const items = getCart();
  let product = CATALOG[productKeyOrName];

  // If passed display name instead of key
  if (!product) {
    const foundKey = Object.keys(CATALOG).find(
      (k) => CATALOG[k].name.toLowerCase() === String(productKeyOrName).toLowerCase()
    );
    product = foundKey
      ? CATALOG[foundKey]
      : {
          id: 'custom-' + Date.now(),
          name: productKeyOrName,
          price: 199,
          icon: '🛍️',
          color: 'Standard'
        };
  }

  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    items.push({ ...product, quantity: 1 });
  }

  saveCart(items);
  showToast(`🛒 "${product.name}" added to cart!`);

  // If on cart page, re-render
  if (document.getElementById('cart-items-container')) {
    renderCartPage();
  }
}

function updateQuantity(productId, delta) {
  const items = getCart();
  const item = items.find((i) => i.id === productId);
  if (!item) return;

  item.quantity = (item.quantity || 1) + delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(items);
  renderCartPage();
}

function removeFromCart(productId) {
  let items = getCart();
  items = items.filter((i) => i.id !== productId);
  saveCart(items);
  showToast('Item removed from cart.');
  renderCartPage();
}

function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('btn-submit-order');

  if (!container) return;

  const items = getCart();

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🛒</div>
        <h3 style="color: var(--text-main); margin-bottom: 8px;">Your cart is currently empty</h3>
        <p style="margin-bottom: 16px; font-size: 0.9rem;">Add some cutting-edge gadgets to get started.</p>
        <a href="/products.html" class="btn btn-primary btn-sm">Explore Catalog &rarr;</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.innerText = '$0.00';
    if (totalEl) totalEl.innerText = '$0.00';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerText = 'Cart is Empty ($0.00)';
    }
    return;
  }

  let subtotal = 0;
  container.innerHTML = items
    .map((item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      subtotal += itemTotal;
      return `
        <div style="display: flex; gap: 16px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-color);" id="cart-row-${item.id}">
          <div style="font-size: 2.2rem; background: rgba(255,255,255,0.05); padding: 10px 14px; border-radius: var(--radius-sm);">${item.icon || '📦'}</div>
          <div style="flex: 1;">
            <h3 style="font-size: 1.05rem; font-weight: 600;">${item.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Color: ${item.color || 'Standard'} &bull; $${item.price} each</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
              <button class="btn btn-sm btn-secondary" style="padding: 2px 8px;" onclick="updateQuantity('${item.id}', -1)">-</button>
              <span style="font-weight: 700; font-size: 0.9rem;">${item.quantity}</span>
              <button class="btn btn-sm btn-secondary" style="padding: 2px 8px;" onclick="updateQuantity('${item.id}', 1)">+</button>
              <button class="btn btn-sm" style="background: none; border: none; color: #f43f5e; cursor: pointer; font-size: 0.8rem; margin-left: 8px;" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="price" style="font-size: 1.25rem;">$${itemTotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    })
    .join('');

  if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `$${subtotal.toFixed(2)}`;
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.innerText = `Complete Order ($${subtotal.toFixed(2)}) 💳`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  if (document.getElementById('cart-items-container')) {
    renderCartPage();
  }
});
