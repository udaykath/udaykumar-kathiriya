document.addEventListener("DOMContentLoaded", function () {

  let selectedVariant = null;
  let currentProduct = null;
  let selectedColor = null;

  document.querySelectorAll('.plus-btn').forEach(btn => {

    btn.addEventListener('click', function () {

      let handle = this.closest('.grid-item').dataset.handle;

      fetch(`/products/${handle}.js`)
        .then(res => res.json())
        .then(product => {

          currentProduct = product;

          selectedVariant = null;
          selectedColor = null;

          // ===== BASIC INFO =====
          document.getElementById('popup-title').innerText = product.title;
          document.getElementById('popup-price').innerText = (product.price / 100).toFixed(2);

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

          // ===== SIZE DROPDOWN (WITH STOCK CHECK) =====
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

            if (selectedOption.disabled) {
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
  const closeBtn = document.querySelector('.close-drawer');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      drawer.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('active');
    });
  }

});