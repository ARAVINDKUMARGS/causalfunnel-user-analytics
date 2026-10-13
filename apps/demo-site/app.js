// Demo Store Interactive Handlers
let cartCount = 0;

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.innerText = cartCount;
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

function addToCart(productName) {
  cartCount++;
  updateCartBadge();
  showToast(`🛒 "${productName}" added to your cart!`);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
