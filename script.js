const products = [
  {id:"headphones",name:"Studio wireless headphones",category:"Tech",price:2499,was:3299,rating:"4.8",reviews:126,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",badge:"BESTSELLER"},
  {id:"lamp",name:"Soft glow table lamp",category:"Home",price:1899,was:2299,rating:"4.7",reviews:84,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85",badge:"LOVED"},
  {id:"sneakers",name:"Everyday comfort sneakers",category:"Style",price:2799,was:3499,rating:"4.6",reviews:213,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",badge:"POPULAR"},
  {id:"bottle",name:"Hydrate stainless bottle",category:"Everyday",price:799,was:999,rating:"4.8",reviews:97,image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85",badge:"GOOD FIND"},
  {id:"watch",name:"Classic everyday watch",category:"Style",price:2199,was:2899,rating:"4.5",reviews:68,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",badge:"JUST IN"},
  {id:"camera",name:"Pocket instant camera",category:"Tech",price:5999,was:6999,rating:"4.9",reviews:52,image:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=85",badge:"TOP RATED"},
  {id:"chair",name:"Sculpted lounge chair",category:"Home",price:8499,was:9999,rating:"4.7",reviews:41,image:"https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=85",badge:"DESIGN PICK"},
  {id:"backpack",name:"Daily carry backpack",category:"Everyday",price:1599,was:1999,rating:"4.6",reviews:133,image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",badge:"EVERYDAY"}
];

const grid = document.getElementById("productGrid");
const filterGroup = document.getElementById("filters");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const resultsNote = document.getElementById("resultsNote");
const cartDrawer = document.getElementById("cartDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const cartItemsNode = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const drawerBottom = document.getElementById("drawerBottom");
const toastNode = document.getElementById("toast");
let activeCategory = "All";
let searchTerm = "";
let toastTimer;
let savedProducts = new Set();
let cart = readCart();

function readCart() {
  try {
    const data = JSON.parse(localStorage.getItem("shopwell-cart") || "[]");
    return Array.isArray(data) ? data.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.qty) && item.qty > 0) : [];
  } catch { return []; }
}
function persistCart() {
  try { localStorage.setItem("shopwell-cart", JSON.stringify(cart)); } catch { showToast("Cart is available until you close this page."); }
}
function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {style:"currency", currency:"INR", maximumFractionDigits:0}).format(amount);
}
function visibleProducts() {
  let list = products.filter(product => (activeCategory === "All" || product.category === activeCategory) &&
    (product.name.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm)));
  if (sortSelect.value === "price-low") list.sort((a,b) => a.price-b.price);
  if (sortSelect.value === "price-high") list.sort((a,b) => b.price-a.price);
  if (sortSelect.value === "rating") list.sort((a,b) => Number(b.rating)-Number(a.rating));
  return list;
}
function renderProducts() {
  const list = visibleProducts();
  grid.innerHTML = list.map(product => {
    const discount = Math.round((1 - product.price/product.was)*100);
    return `<article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge">${product.badge}</span>
        <button class="save-button ${savedProducts.has(product.id) ? "saved" : ""}" type="button" data-save="${product.id}" aria-label="${savedProducts.has(product.id) ? "Remove from" : "Save to"} favourites">${savedProducts.has(product.id) ? "♥" : "♡"}</button>
      </div>
      <div class="product-meta">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name" title="${product.name}">${product.name}</h3>
        <div class="product-rating"><span class="stars" aria-label="${product.rating} out of 5 stars">★★★★★</span> ${product.rating} <span>(${product.reviews})</span></div>
        <div class="product-price-row"><span class="product-price">${formatPrice(product.price)}</span><span class="old-price">${formatPrice(product.was)}</span><span class="discount">${discount}% off</span></div>
        <button class="add-button" type="button" data-add="${product.id}">Add to cart <span aria-hidden="true">+</span></button>
      </div>
    </article>`;
  }).join("");
  emptyState.hidden = list.length !== 0;
  grid.hidden = list.length === 0;
  resultsNote.textContent = searchTerm || activeCategory !== "All" ? `${list.length} ${list.length === 1 ? "find" : "finds"} to explore` : "Thoughtful finds for everyday life";
}
function updateFilter(category) {
  activeCategory = category;
  filterGroup.querySelectorAll(".filter-chip").forEach(button => button.classList.toggle("active", button.dataset.category === category));
  renderProducts();
}
function addToCart(id) {
  const product = products.find(item => item.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({id, qty:1});
  persistCart();
  renderCart();
  showToast(`${product.name} added to your cart`);
}
function changeQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) cart = cart.filter(entry => entry.id !== id);
  persistCart();
  renderCart();
}
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  persistCart();
  renderCart();
}
function renderCart() {
  const totalItems = cart.reduce((sum,item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = totalItems;
  document.getElementById("drawerItemCount").textContent = `(${totalItems})`;
  cartEmpty.hidden = cart.length > 0;
  drawerBottom.hidden = cart.length === 0;
  cartItemsNode.innerHTML = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return `<article class="cart-line">
      <img src="${product.image}" alt="">
      <div><h3>${product.name}</h3><span class="line-price">${formatPrice(product.price)}</span>
        <div class="line-controls"><button type="button" data-qty="-1" data-id="${product.id}" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button type="button" data-qty="1" data-id="${product.id}" aria-label="Increase quantity">+</button></div>
      </div>
      <button class="remove-item" type="button" data-remove="${product.id}">Remove</button>
    </article>`;
  }).join("");
  const subtotal = cart.reduce((sum,item) => sum + products.find(product => product.id === item.id).price * item.qty, 0);
  document.getElementById("cartSubtotal").textContent = formatPrice(subtotal);
}
function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden","false");
  drawerBackdrop.hidden = false;
  document.body.classList.add("cart-open");
  document.getElementById("closeCart").focus();
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden","true");
  drawerBackdrop.hidden = true;
  document.body.classList.remove("cart-open");
  document.getElementById("openCart").focus();
}
function showToast(message) {
  toastNode.textContent = message;
  toastNode.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastNode.classList.remove("show"), 2400);
}

filterGroup.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) updateFilter(button.dataset.category);
});
document.querySelectorAll("[data-nav-category]").forEach(link => link.addEventListener("click", () => updateFilter(link.dataset.navCategory)));
document.getElementById("searchForm").addEventListener("submit", event => { event.preventDefault(); searchTerm = searchInput.value.trim().toLowerCase(); renderProducts(); document.getElementById("products").scrollIntoView({behavior:"smooth"}); });
searchInput.addEventListener("input", () => { searchTerm = searchInput.value.trim().toLowerCase(); renderProducts(); });
sortSelect.addEventListener("change", renderProducts);
document.getElementById("clearSearch").addEventListener("click", () => { searchInput.value = ""; searchTerm = ""; updateFilter("All"); });
grid.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const save = event.target.closest("[data-save]");
  if (add) addToCart(add.dataset.add);
  if (save) {
    const id = save.dataset.save;
    if (savedProducts.has(id)) savedProducts.delete(id); else savedProducts.add(id);
    renderProducts();
    showToast(savedProducts.has(id) ? "Saved to your favourites" : "Removed from your favourites");
  }
});
cartItemsNode.addEventListener("click", event => {
  const qty = event.target.closest("[data-qty]");
  const remove = event.target.closest("[data-remove]");
  if (qty) changeQuantity(qty.dataset.id, Number(qty.dataset.qty));
  if (remove) removeFromCart(remove.dataset.remove);
});
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart(); });
document.getElementById("checkoutButton").addEventListener("click", () => showToast("This is a shopping demo — checkout isn’t connected yet."));
renderProducts();
renderCart();
