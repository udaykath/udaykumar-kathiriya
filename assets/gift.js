document.addEventListener("DOMContentLoaded", function () {

  let selectedVariant = null;
  let currentProduct = null;
  let selectedColor = null;

  // AUTO CURRENCY FORMAT (BASED ON STORE)
function formatMoney(cents) {
  let currency = window.Shopify?.currency?.active || "USD";

  let amount = (cents / 100).toFixed(2);

  // MANUAL SYMBOL MAP (CLEAN)
  const symbols = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    AUD: "$",
    CAD: "$",
    SGD: "$",
    AED: "د.إ"
  };

  let symbol = symbols[currency] || "$";

  return `${amount}${symbol}`; // ✅ NO SPACE + AFTER PRICE
}

  document.querySelectorAll('.plus-btn').forEach(btn => {

    btn.addEventListener('click', function () {

      let handle = this.closest('.grid-item').dataset.handle;

      fetch(`/products/${handle}.js`)
        .then(res => res.json())
        .then(product => {

          currentProduct = product;

          // 🔥 RESET STATE
          selectedVariant = null;
          selectedColor = null;

          // ===== BASIC INFO =====
          document.getElementById('popup-title').innerText = product.title;

          // ✅ FIXED CURRENCY HERE
          document.getElementById('popup-price').innerText = formatMoney(product.price);

          if (product.images.length) {
            document.getElementById('popup-img').src = product.images[0];
          }

          document.getElementById('popup-desc').innerText =
            product.description.replace(/<[^>]*>?/gm, '');

          // ===== COLORS =====
          let colorIndex = product.options.findIndex(opt =>
            opt.name.toLowerCase() === 'color'
          );

          let colorsHTML = '';

          if (colorIndex !== -1) {
            let used = [];

            product.variants.forEach(v => {
              let color = v.options[colorIndex];

              if (!used.includes(color)) {
                used.push(color);

                colorsHTML += `
                  <div class="color-swatch" data-color="${color}">
                    <span class="color-bar" style="background:${color.toLowerCase()}"></span>
                    ${color}
                  </div>
                `;
              }
            });
          }

          document.getElementById('colors').innerHTML = colorsHTML;

          // ===== SIZE DROPDOWN =====
          let sizeHTML = `<option value="">Choose your size</option>`;

          product.variants.forEach(v => {

            let disabled = !v.available ? 'disabled' : '';

            sizeHTML += `
              <option 
                value="${v.id}" 
                data-options='${JSON.stringify(v.options)}'
                ${disabled}
              >
                ${v.title} ${!v.available ? '(Out of stock)' : ''}
              </option>
            `;
          });

          document.getElementById('sizes').innerHTML = sizeHTML;

          // ===== OPEN POPUP =====
          document.getElementById('popup').classList.add('active');

          // ===== COLOR CLICK =====
          document.querySelectorAll('.color-swatch').forEach(el => {
            el.addEventListener('click', function () {

              document.querySelectorAll('.color-swatch').forEach(e => e.classList.remove('active'));
              this.classList.add('active');

              selectedColor = this.dataset.color;

              // 🔥 RESET SIZE
              document.getElementById('sizes').value = "";
              selectedVariant = null;

              // 🔥 FILTER SIZES BASED ON COLOR + STOCK
              document.querySelectorAll('#sizes option').forEach(opt => {

                if (!opt.value) return;

                let opts = JSON.parse(opt.dataset.options || "[]");
                let variant = currentProduct.variants.find(v => v.id == opt.value);

                if (!opts.includes(selectedColor) || !variant.available) {
                  opt.disabled = true;
                } else {
                  opt.disabled = false;
                }

              });

            });
          });

          // ===== SIZE CHANGE =====
          document.getElementById('sizes').addEventListener('change', function () {

            let selectedOption = this.options[this.selectedIndex];

            if (!selectedOption.value || selectedOption.disabled) {
              selectedVariant = null;
              return;
            }

            selectedVariant = selectedOption.value;

          });

        });

    });

  });

  // ===== ADD TO CART =====
  document.getElementById('add-to-cart').addEventListener('click', function () {

    if (!selectedColor) {
      alert('Please select color');
      return;
    }

    if (!selectedVariant) {
      alert('Please select available size');
      return;
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedVariant,
        quantity: 1
      })
    })
    .then(res => res.json())
    .then(() => {

      document.getElementById('popup').classList.remove('active');
      window.location.href = '/cart';

    });

  });

  // ===== CLOSE POPUP =====
  document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('popup').classList.remove('active');
  });

  // ===== HEADER JS =====
 const openBtn = document.querySelector('.mobile-menu');
  const drawer = document.querySelector('.mobile-drawer');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openBtn.classList.toggle('active');
      drawer.classList.toggle('active');
    });
  }

});