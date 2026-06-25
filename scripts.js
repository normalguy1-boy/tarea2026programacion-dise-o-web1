import { productos, carrito } from "./list.js"

const grid = document.querySelector(".grid")
const contenedorCarrito = document.querySelector(".contedor-del-carrito")
const totalVal = document.querySelector("#total-val")
const cartBtn = document.querySelector(".cart-wrap")
const overlay = document.querySelector("#overlay")
const modal = document.querySelector("#modal")
const modalClose = document.querySelector("#modal-close")

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito))
}

function cargarCarrito() {
    const guardado = JSON.parse(localStorage.getItem("carrito")) || []
    guardado.forEach(item => carrito.push(item))
}

cargarCarrito()

productos.forEach((producto) => {

    const div = document.createElement("div")
    const img = document.createElement("img")
    const nombre = document.createElement("h2")
    const precio = document.createElement("p")
    const btnAgregar = document.createElement("button")

    img.src = producto.img
    img.alt = producto.nombre
    nombre.textContent = producto.nombre
    precio.textContent = `$${producto.precio}`
    btnAgregar.textContent = "Agregar al carrito"

    const sinStock = producto.stock === 0 || producto.stock === "sin-stock"
    if (sinStock) btnAgregar.disabled = true

    div.append(img, nombre, precio, btnAgregar)
    grid.append(div)

    btnAgregar.addEventListener("click", () => {

        const encontrado = carrito.find(el => el.id === producto.id)

        if (encontrado) {
            encontrado.cantidad += 1
        } else {
            carrito.push({ ...producto, cantidad: 1 })
        }

        guardarCarrito()
        abrirCarrito()
        renderCarrito()
    })
})

function renderCarrito() {

    const footer = contenedorCarrito.querySelector(".sidebar-footer")

    while (contenedorCarrito.firstChild) {
        contenedorCarrito.removeChild(contenedorCarrito.firstChild)
    }

    contenedorCarrito.appendChild(footer)

    if (carrito.length === 0) {
        const vacio = document.createElement("p")
        vacio.textContent = "El carrito está vacío"
        vacio.style.cssText = "font-size:12px;color:var(--text-light);text-align:center;padding:20px 0;"
        contenedorCarrito.insertBefore(vacio, footer)
        totalVal.textContent = "$0"
        return
    }

    const frag = document.createDocumentFragment()

    carrito.forEach((el) => {

        const item = document.createElement("div")

        const nombre = document.createElement("span")
        nombre.style.cssText = "flex:1;font-size:11px;"
        nombre.textContent = el.nombre

        const precio = document.createElement("span")
        precio.style.fontFamily = "'Cinzel',serif"
        precio.style.color = "var(--gold)"
        precio.style.fontSize = "12px"
        precio.textContent = `$${el.precio * el.cantidad}`

        const btnSuma = document.createElement("button")
        btnSuma.className = "btn-suma"
        btnSuma.dataset.id = el.id
        btnSuma.title = "Sumar"
        btnSuma.textContent = "+"

        const btnResta = document.createElement("button")
        btnResta.className = "btn-resta"
        btnResta.dataset.id = el.id
        btnResta.title = "Restar"
        btnResta.textContent = "-"

        const btnEliminar = document.createElement("button")
        btnEliminar.className = "btn-eliminar"
        btnEliminar.dataset.id = el.id
        btnEliminar.title = "Eliminar"
        btnEliminar.textContent = "✕"

        item.append(nombre, precio, btnSuma, btnResta, btnEliminar)
        frag.append(item)
    })

    contenedorCarrito.insertBefore(frag, footer)

    const total = carrito.reduce((acc, el) => acc + el.precio * el.cantidad, 0)
    totalVal.textContent = `$${total}`

    if (!contenedorCarrito.querySelector(".btn-finalizar")) {
        const btnFinalizar = document.createElement("button")
        btnFinalizar.textContent = "Finalizar compra"
        btnFinalizar.className = "btn-finalizar"
        btnFinalizar.style.cssText = "width:100%;margin-top:10px;font-family:'Lato',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:9px 0;border:none;border-radius:2px;background:var(--gold);color:#fff;cursor:pointer;font-weight:700;"
        btnFinalizar.addEventListener("click", finalizarCompra)
        footer.appendChild(btnFinalizar)
    }

    if (!contenedorCarrito.querySelector(".btn-vaciar")) {
        const btnVaciar = document.createElement("button")
        btnVaciar.textContent = "Vaciar carrito"
        btnVaciar.className = "btn-vaciar"
        btnVaciar.style.cssText = "width:100%;margin-top:6px;font-family:'Lato',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:9px 0;border:1px solid var(--gold);border-radius:2px;background:transparent;color:var(--gold);cursor:pointer;font-weight:700;"
        btnVaciar.addEventListener("click", vaciarCarrito)
        footer.appendChild(btnVaciar)
    }
}

contenedorCarrito.addEventListener("click", (e) => {

    const isSuma = e.target.classList.contains("btn-suma")
    const isResta = e.target.classList.contains("btn-resta")
    const isEliminar = e.target.classList.contains("btn-eliminar")

    if (!isSuma && !isResta && !isEliminar) return

    const id = parseInt(e.target.dataset.id)
    const el = carrito.find(x => x.id === id)
    const index = carrito.findIndex(x => x.id === id)

    if (!el) return

    if (isSuma) el.cantidad += 1
    else if (isResta && el.cantidad > 1) el.cantidad -= 1
    else if (isResta || isEliminar) carrito.splice(index, 1)

    guardarCarrito()
    renderCarrito()
})

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

function finalizarCompra() {
    if (carrito.length === 0) return
    cerrarCarrito()
    modal.classList.add("open")
    vaciarCarrito()
}

function vaciarCarrito() {
    if (carrito.length === 0) return
    carrito.length = 0
    localStorage.removeItem("carrito")
    renderCarrito()
}

modalClose.addEventListener("click", () => {
    modal.classList.remove("open")
})

renderCarrito()
