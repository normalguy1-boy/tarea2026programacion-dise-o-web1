import { productos } from "./list.js"

const itemsCarrito = []

const grid               = document.querySelector(".grid")
const contenedorCarrito  = document.querySelector(".contedor-del-carrito")
const totalVal           = document.querySelector("#total-val")
const cartBtn            = document.querySelector(".cart-wrap")
const overlay            = document.querySelector("#overlay")
const modal              = document.querySelector("#modal")
const modalClose         = document.querySelector("#modal-close")

// ── Renderizar productos ──────────────────────────────────────────
productos.forEach((producto) => {
    const div        = document.createElement("div")
    const img        = document.createElement("img")
    const nombre     = document.createElement("h2")
    const precio     = document.createElement("p")
    const btnAgregar = document.createElement("button")

    img.src                = producto.img
    img.alt                = producto.nombre
    nombre.textContent     = producto.nombre
    precio.textContent     = `$${producto.precio}`
    btnAgregar.textContent = "Agregar al carrito"

    const sinStock = producto.stock === 0 || producto.stock === "sin-stock"
    if (sinStock) btnAgregar.disabled = true

    div.append(img, nombre, precio, btnAgregar)
    grid.append(div)

    btnAgregar.addEventListener("click", () => {
        const encontrado = itemsCarrito.find(el => el.id === producto.id)
        if (encontrado) {
            encontrado.cantidad += 1
        } else {
            itemsCarrito.push({ ...producto, cantidad: 1 })
        }
        abrirCarrito()
        renderCarrito()
    })
})

// ── Render carrito ────────────────────────────────────────────────
function renderCarrito() {
    // Limpiar items anteriores (todo excepto el sidebar-footer)
    const footer = contenedorCarrito.querySelector(".sidebar-footer")
    contenedorCarrito.innerHTML = ""
    contenedorCarrito.appendChild(footer)

    if (itemsCarrito.length === 0) {
        const vacio = document.createElement("p")
        vacio.textContent = "El carrito está vacío"
        vacio.style.cssText = "font-size:12px;color:var(--text-light);text-align:center;padding:20px 0;"
        contenedorCarrito.insertBefore(vacio, footer)
        totalVal.textContent = "$0"
        return
    }

    const frag = document.createDocumentFragment()

    itemsCarrito.forEach((el) => {
        const item = document.createElement("div")
        item.innerHTML = `
            <span style="flex:1;font-size:11px;">${el.nombre}</span>
            <span style="font-family:'Cinzel',serif;color:var(--gold);font-size:12px;">$${el.precio * el.cantidad}</span>
            <button class="btn-suma"     data-id="${el.id}" title="Sumar">+</button>
            <button class="btn-resta"    data-id="${el.id}" title="Restar">-</button>
            <button class="btn-eliminar" data-id="${el.id}" title="Eliminar">✕</button>
        `
        frag.append(item)
    })

    contenedorCarrito.insertBefore(frag, footer)

    const total = itemsCarrito.reduce((acc, el) => acc + el.precio * el.cantidad, 0)
    totalVal.textContent = `$${total}`

    // Botón finalizar (se agrega una sola vez)
    if (!contenedorCarrito.querySelector(".btn-finalizar")) {
        const btnFinalizar = document.createElement("button")
        btnFinalizar.textContent = "Finalizar compra"
        btnFinalizar.className = "btn-finalizar"
        btnFinalizar.style.cssText = "width:100%;margin-top:10px;font-family:'Lato',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:9px 0;border:none;border-radius:2px;background:var(--gold);color:#fff;cursor:pointer;font-weight:700;"
        btnFinalizar.addEventListener("click", finalizarCompra)
        footer.appendChild(btnFinalizar)
    }
}

// ── Delegación de clicks en carrito ──────────────────────────────
contenedorCarrito.addEventListener("click", (e) => {
    const isSuma     = e.target.classList.contains("btn-suma")
    const isResta    = e.target.classList.contains("btn-resta")
    const isEliminar = e.target.classList.contains("btn-eliminar")

    if (!isSuma && !isResta && !isEliminar) return

    const id      = parseInt(e.target.dataset.id)
    const el      = itemsCarrito.find(x => x.id === id)
    const index   = itemsCarrito.findIndex(x => x.id === id)

    if (!el) return

    if      (isSuma)                       el.cantidad += 1
    else if (isResta && el.cantidad > 1)   el.cantidad -= 1
    else if (isResta || isEliminar)        itemsCarrito.splice(index, 1)

    renderCarrito()
})

// ── Abrir / cerrar carrito ────────────────────────────────────────
function abrirCarrito() {
    contenedorCarrito.style.display = "flex"
    overlay.classList.add("active")
}

function cerrarCarrito() {
    contenedorCarrito.style.display = "none"
    overlay.classList.remove("active")
}

cartBtn.addEventListener("click", () => {
    const estaAbierto = contenedorCarrito.style.display === "flex"
    estaAbierto ? cerrarCarrito() : abrirCarrito()
})

overlay.addEventListener("click", cerrarCarrito)

// ── Finalizar compra → modal ──────────────────────────────────────
function finalizarCompra() {
    if (itemsCarrito.length === 0) return
    cerrarCarrito()
    modal.classList.add("open")
}

modalClose.addEventListener("click", () => {
    modal.classList.remove("open")
})
