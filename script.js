// ===============================
// Dados do menu (
// ===============================
const MENU = [
  { id: 1, nome: "Classic Smash", desc: "Carne, cheddar, cebola, picles e molho da casa.", preco: 28.90, tag: "smash" },
  { id: 2, nome: "Bacon & Cheddar", desc: "Carne, cheddar, bacon crocante e maionese.", preco: 32.90, tag: "bacon" },
  { id: 3, nome: "Duplo Smash", desc: "2 carnes smash, cheddar duplo e cebola.", preco: 36.90, tag: "duplo" },
  { id: 4, nome: "Frango Crispy", desc: "Frango empanado, alface, molho e queijo.", preco: 29.90, tag: "crispy" },
  { id: 5, nome: "Veggie", desc: "Hambúrguer vegetal, queijo, tomate e molho.", preco: 27.90, tag: "veggie" },
  { id: 6, nome: "Batata Frita", desc: "Porção de batata com sal e páprica.", preco: 14.90, tag: "acomp" },
  { id: 7, nome: "Refrigerante Lata", desc: "350ml (sabores variados).", preco: 6.50, tag: "bebida" },
  { id: 8, nome: "Milkshake", desc: "Baunilha, chocolate ou morango.", preco: 16.90, tag: "bebida" },
];

// ===============================
// Helpers
// ===============================
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

// ===============================
// Elementos
// ===============================
const menuGrid = qs("#menuGrid");

const cartDrawer = qs("#cartDrawer");
const backdrop = qs("#backdrop");
const openCartBtn = qs("#openCart");
const closeCartBtn = qs("#closeCart");
const cartItemsEl = qs("#cartItems");
const cartTotalEl = qs("#cartTotal");
const cartCountEl = qs("#cartCount");

const checkoutBtn = qs("#checkoutBtn");
const clearBtn = qs("#clearBtn");
const whatsBtn = qs("#whatsBtn");

const menuBtn = qs("#menuBtn");
const nav = qs("#nav");

const scrollToCartBtn = qs("#scrollToCart");

// ===============================
// Carrinho (estado)
// 
// ===============================
let cart = {};

// ===============================
// Render menu
// ===============================
function renderMenu(lista) {
  menuGrid.innerHTML = "";

  lista.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="pill">${item.tag}</div>
      <h3>${item.nome}</h3>
      <p>${item.desc}</p>

      <div class="meta">
        <span class="price">${brl(item.preco)}</span>
        <button class="btn small primary" data-add="${item.id}">Adicionar</button>
      </div>
    `;

    menuGrid.appendChild(card);
  });

  // Eventos dos botões
  qsa("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      addToCart(id);
      openCart();
    });
  });
}

// ===============================
// Cart actions
// ===============================
function addToCart(id) {
  const item = MENU.find((i) => i.id === id);
  if (!item) return;

  if (!cart[id]) {
    cart[id] = { id: item.id, nome: item.nome, preco: item.preco, qtd: 1 };
  } else {
    cart[id].qtd += 1;
  }

  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;

  cart[id].qtd += delta;

  if (cart[id].qtd <= 0) delete cart[id];

  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function getTotals() {
  const itens = Object.values(cart);
  const count = itens.reduce((acc, it) => acc + it.qtd, 0);
  const total = itens.reduce((acc, it) => acc + it.preco * it.qtd, 0);
  return { count, total };
}

// ===============================
// Render cart
// ===============================
function renderCart() {
  const itens = Object.values(cart);

  if (itens.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-item">
        <p>Seu carrinho está vazio. 😄</p>
        <p style="opacity:.7; font-size:14px;">Adicione itens do cardápio para montar seu pedido.</p>
      </div>
    `;
  } else {
    cartItemsEl.innerHTML = "";

    itens.forEach((it) => {
      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <div class="cart-row">
          <strong>${it.nome}</strong>
          <span>${brl(it.preco * it.qtd)}</span>
        </div>

        <div class="cart-row">
          <div class="qty">
            <button aria-label="Diminuir" data-dec="${it.id}">−</button>
            <strong>${it.qtd}</strong>
            <button aria-label="Aumentar" data-inc="${it.id}">+</button>
          </div>
          <button class="btn small" data-remove="${it.id}">Remover</button>
        </div>
      `;

      cartItemsEl.appendChild(div);
    });

    qsa("[data-inc]").forEach((b) => b.addEventListener("click", () => changeQty(Number(b.dataset.inc), 1)));
    qsa("[data-dec]").forEach((b) => b.addEventListener("click", () => changeQty(Number(b.dataset.dec), -1)));
    qsa("[data-remove]").forEach((b) => b.addEventListener("click", () => { delete cart[Number(b.dataset.remove)]; saveCart(); renderCart(); }));
  }

  const { count, total } = getTotals();
  cartCountEl.textContent = String(count);
  cartTotalEl.textContent = brl(total);

  // Atualiza link do Whats
  const link = buildWhatsLink();
  whatsBtn.href = link;
}

// ===============================
// WhatsApp checkout
// ===============================
function buildWhatsLink() {
  // Troque aqui pelo seu número (com DDI e DDD):
  // Ex: 5511999999999 (Brasil +55, SP 11)
  const phone = "5511999999999";

  const itens = Object.values(cart);
  const { total } = getTotals();

  let msg = "Olá! Quero fazer um pedido na BurguerLab:%0A%0A";

  if (itens.length === 0) {
    msg += "— (carrinho vazio)%0A";
  } else {
    itens.forEach((it) => {
      msg += `• ${it.qtd}x ${it.nome} — ${brl(it.preco * it.qtd)}%0A`;
    });
    msg += `%0A*Total:* ${brl(total)}%0A`;
  }

  msg += "%0AEndereço: ____%0AForma de pagamento: ____";

  return `https://wa.me/${phone}?text=${msg}`;
}

// ===============================
// Drawer controls
// ===============================
function openCart() {
  cartDrawer.classList.add("open");
  backdrop.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
  backdrop.setAttribute("aria-hidden", "true");
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

scrollToCartBtn.addEventListener("click", () => {
  openCart();
});


// ===============================
// Mobile menu
// ===============================
menuBtn.addEventListener("click", () => {
  nav.classList.toggle("show");
});

// Fecha menu ao clicar em link
qsa(".nav a").forEach((a) => {
  a.addEventListener("click", () => nav.classList.remove("show"));
});

// ===============================
// LocalStorage
// ===============================
function saveCart() {
  localStorage.setItem("burguerlab_cart", JSON.stringify(cart));
}

function loadCart() {
  const raw = localStorage.getItem("burguerlab_cart");
  if (!raw) return;
  try {
    cart = JSON.parse(raw) || {};
  } catch {
    cart = {};
  }
}

// ===============================
// Init
// ===============================
loadCart();
renderMenu(MENU);
renderCart();

// Finalizar
checkoutBtn.addEventListener("click", () => {
  const link = buildWhatsLink();
  window.open(link, "_blank");
});

// Limpar
clearBtn.addEventListener("click", clearCart);