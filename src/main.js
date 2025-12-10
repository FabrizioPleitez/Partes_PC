import "../less/style.less";
import { getData } from "./data/index.js";

const data = getData("index");
const products = data.products || [];
const components = data.components || [];

const productsByCategory = products.reduce((acc, product) => {
  if (!acc[product.category]) {
    acc[product.category] = [];
  }
  acc[product.category].push(product);
  return acc;
}, {});

let cart = [];

function formatCurrency(value) {
  return "L " + Number(value).toFixed(2);
}

function renderProducts(categoryId) {
  const container = document.querySelector("#lista-productos");
  const title = document.querySelector("#titulo-productos");

  if (!container || !title) return;

  const list = productsByCategory[categoryId] || [];
  const component = components.find((c) => c.id === categoryId);

  if (component) {
    title.textContent = `Opciones para ${component.nombre}`;
  } else {
    title.textContent = "Opciones disponibles";
  }

  if (list.length === 0) {
    container.innerHTML = `
      <p class="mensaje-vacio">
        Aún no hay productos configurados para este componente.
      </p>
    `;
    return;
  }

  container.innerHTML = list
    .map((product) => {
      const disabled = product.status === "agotado" ? "disabled" : "";
      const badgeHtml = product.badge
        ? `<span class="producto-badge">${product.badge}</span>`
        : "";

      const priceHtml = product.discountPrice
        ? `<p class="producto-precio">
            <span class="precio-tachado">${formatCurrency(product.price)}</span>
            <span class="precio-descuento">${formatCurrency(product.discountPrice)}</span>
          </p>`
        : `<p class="producto-precio">${formatCurrency(product.price)}</p>`;

      const stockHtml =
        product.status === "agotado"
          ? '<p class="producto-stock agotado">Agotado</p>'
          : '<p class="producto-stock disponible">Disponible</p>';

      return `
        <article class="producto-card">
          ${badgeHtml}
          <img src="${product.image}" alt="${product.name}" class="producto-imagen" loading="lazy" />
          <h3 class="producto-nombre">${product.name}</h3>
          <p class="producto-descripcion">${product.description}</p>
          ${priceHtml}
          ${stockHtml}
          <button
            class="btn btn-primary btn-agregar-carrito"
            data-id="${product.id}"
            ${disabled}
          >
            Agregar al carrito
          </button>
        </article>
      `;
    })
    .join("");

  attachAddToCartEvents();
  const catalogo = document.querySelector("#catalogo");
  if (catalogo) {
    catalogo.scrollIntoView({ behavior: "smooth" });
  }
}

function attachComponentButtons() {
  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.getAttribute("data-category");
      renderProducts(categoryId);
    });
  });
}

function attachAddToCartEvents() {
  document.querySelectorAll(".btn-agregar-carrito").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      addToCart(id);
    });
  });
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product || product.status === "agotado") return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const container = document.querySelector("#carrito-items");
  const totalElement = document.querySelector("#carrito-total");
  const emptyMessage = document.querySelector("#carrito-vacio");

  if (!container || !totalElement || !emptyMessage) return;

  if (cart.length === 0) {
    container.innerHTML = "";
    emptyMessage.style.display = "block";
    totalElement.textContent = formatCurrency(0);
    return;
  }

  emptyMessage.style.display = "none";

  let total = 0;
  container.innerHTML = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return "";

      const unitPrice = product.discountPrice || product.price;
      const itemTotal = unitPrice * item.qty;
      total += itemTotal;

      return `
        <div class="carrito-item">
          <div class="carrito-item-info">
            <h4>${product.name}</h4>
            <p>Cantidad: ${item.qty}</p>
          </div>
          <div class="carrito-item-acciones">
            <p>${formatCurrency(itemTotal)}</p>
            <button class="btn btn-link btn-eliminar" data-id="${product.id}">
              Quitar
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  totalElement.textContent = formatCurrency(total);

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      cart = cart.filter((item) => item.id !== id);
      renderCart();
    });
  });
}

function setupCheckout() {
  const btnPagar = document.querySelector("#btn-pagar");
  if (!btnPagar) return;

  btnPagar.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío. Agrega productos antes de pagar.");
      return;
    }

    alert("Pago exitoso. ¡Gracias por tu compra! (Simulación)");
    cart = [];
    renderCart();
  });
}

function setupBuilderForm() {
  const form = document.querySelector("#form-armar-pc");
  const message = document.querySelector("#mensaje-cotizacion");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();

    if (message) {
      message.textContent =
        "Tu solicitud de cotización fue enviada. Nos pondremos en contacto contigo de forma personal y privada.";
      message.style.display = "block";
    } else {
      alert(
        "Tu solicitud de cotización fue enviada. Nos pondremos en contacto contigo de forma personal y privada."
      );
    }

    const armaTuPc = document.querySelector("#arma-tu-pc");
    if (armaTuPc) {
      armaTuPc.scrollIntoView({ behavior: "smooth" });
    }
    
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachComponentButtons();
  setupBuilderForm();
  setupCheckout();
  renderCart();
});

