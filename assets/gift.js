document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', function () {

      let raw = this.parentElement.getAttribute('data-product')

      if (!raw) return;

      let product = JSON.parse(raw)

      // BASIC
      document.getElementById('popup-title').innerText = product.title
      document.getElementById('popup-price').innerText = (product.price / 100).toFixed(2)

      if(product.featured_image){
        document.getElementById('popup-img').src = product.featured_image
      }

      // COLORS SAFE
      let colorsHTML = ''

      if (product.options && product.options.length) {
        product.options.forEach((opt, i) => {

          if (opt.name && opt.name.toLowerCase() === 'color') {

            let used = []

            product.variants.forEach(v => {

              let color = v.option1

              if (!used.includes(color)) {
                used.push(color)

                colorsHTML += `
                  <span class="color-swatch" data-color="${color}">
                    <span style="background:${color}"></span>
                    ${color}
                  </span>
                `
              }

            })
          }

        })
      }

      document.getElementById('colors').innerHTML = colorsHTML

      // SIZES
      let sizeHTML = ''

      product.variants.forEach(v => {
        sizeHTML += `<option value="${v.id}">${v.title}</option>`
      })

      document.getElementById('sizes').innerHTML = sizeHTML

      // OPEN POPUP
      document.getElementById('popup').classList.add('active')

    })
  })

  // CLOSE
  document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('popup').classList.remove('active')
  })

})