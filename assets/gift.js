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

          // BASIC INFO
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

          // DEFAULT ACTIVE COLOR
          let firstColor = document.querySelector('.color-swatch');
          if (firstColor) {
            firstColor.classList.add('active');
            selectedColor = firstColor.dataset.color;
          }

          // ===== SIZES =====
          let sizeHTML = '';
          product.variants.forEach(v => {
            sizeHTML += `<option value="${v.id}">${v.title}</option>`;
          });

          document.getElementById('sizes').innerHTML = sizeHTML;

          selectedVariant = product.variants[0].id;

          // OPEN POPUP
          document.getElementById('popup').classList.add('active');

          // ===== COLOR CLICK =====
          document.querySelectorAll('.color-swatch').forEach(el => {
            el.addEventListener('click', function () {

              document.querySelectorAll('.color-swatch').forEach(e => e.classList.remove('active'));
              this.classList.add('active');

              selectedColor = this.dataset.color;

              let sizeSelect = document.getElementById('sizes');
              let selectedSize = sizeSelect.options[sizeSelect.selectedIndex]?.text;

              let matchedVariant = product.variants.find(v =>
                v.options.includes(selectedColor) && v.title.includes(selectedSize)
              );

              if (matchedVariant) {
                selectedVariant = matchedVariant.id;
              }

            });
          });

          // ===== SIZE CHANGE =====
          document.getElementById('sizes').addEventListener('change', function () {

            let selectedSize = this.options[this.selectedIndex].text;

            let activeColor = document.querySelector('.color-swatch.active')?.dataset.color;

            let matchedVariant = product.variants.find(v =>
              v.options.includes(activeColor) && v.title.includes(selectedSize)
            );

            if (matchedVariant) {
              selectedVariant = matchedVariant.id;
            }

          });

        });

    });

  });

  // ===== ADD TO CART =====
  document.getElementById('add-to-cart').addEventListener('click', function () {

    if (!selectedVariant) {
      alert('Please select options');
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

  // ===== CLOSE =====
  document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('popup').classList.remove('active');
  });

});