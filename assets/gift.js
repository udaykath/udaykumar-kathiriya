document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll('.plus-btn').forEach(btn => {

    btn.addEventListener('click', function () {

      let raw = this.closest('.grid-item').dataset.product

      if (!raw) return;

      let product = JSON.parse(raw)

      // TITLE + PRICE
      document.getElementById('popup-title').innerText = product.title || ''
      document.getElementById('popup-price').innerText = product.price ? (product.price / 100).toFixed(2) : ''

      // IMAGE
      if (product.featured_image) {
        document.getElementById('popup-img').src = product.featured_image
      }

      // COLORS (SAFE)
      let colorsHTML = ''
      let colorIndex = -1

      if (product.options_with_values) {
        product.options_with_values.forEach((opt, i) => {
          if (opt.name && opt.name.toLowerCase() === 'color') {
            colorIndex = i
          }
        })
      }

      if (colorIndex !== -1 && product.variants) {
        let used = []

        product.variants.forEach(v => {

          let color = v.options[colorIndex]

          if (color && !used.includes(color)) {
            used.push(color)

            colorsHTML += `
              <span class="color-swatch">
                <span style="background:${color}"></span>
                ${color}
              </span>
            `
          }
        })
      }

      document.getElementById('colors').innerHTML = colorsHTML

      // SIZES
      let sizeHTML = ''

      if (product.variants) {
        product.variants.forEach(v => {
          sizeHTML += `<option value="${v.id}">${v.title}</option>`
        })
      }

      document.getElementById('sizes').innerHTML = sizeHTML

      // OPEN POPUP
      document.getElementById('popup').classList.add('active')

    })

  })

  // CLOSE POPUP
  let closeBtn = document.querySelector('.close')
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      document.getElementById('popup').classList.remove('active')
    })
  }

})