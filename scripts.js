import { productos, carrito } from "./list.js"
// ─── Selección de elementos del DOM ───────────────────────────────────────────
// Traemos todos los elementos que vamos a necesitar manipular
const grid               = document.querySelector(".grid")               // Contenedor de la grilla de productos
const contenedorCarrito  = document.querySelector(".contedor-del-carrito") // Sidebar del carrito
const totalVal           = document.querySelector("#total-val")           // Texto del total
const cartBtn            = document.querySelector(".cart-wrap")           // Botón para abrir/cerrar carrito
const overlay            = document.querySelector("#overlay")             // Fondo oscuro detrás del carrito
const modal              = document.querySelector("#modal")               // Modal de confirmación de compra
const modalClose         = document.querySelector("#modal-close")         // Botón para cerrar el modal

// ─── Renderizado de productos ──────────────────────────────────────────────────
// Iteramos sobre cada producto del array importado y creamos su tarjeta en la grilla
productos.forEach((producto) => {

    // Creamos los elementos HTML de la tarjeta con createElement (sin innerHTML)
    const div       = document.createElement("div")
    const img       = document.createElement("img")
    const nombre    = document.createElement("h2")
    const precio    = document.createElement("p")
    const btnAgregar = document.createElement("button")

    // Asignamos los valores de cada producto a los elementos creados
    img.src              = producto.img
    img.alt              = producto.nombre
    nombre.textContent   = producto.nombre
    precio.textContent   = `$${producto.precio}`
    btnAgregar.textContent = "Agregar al carrito"

    // Si el producto no tiene stock, deshabilitamos el botón
    const sinStock = producto.stock === 0 || producto.stock === "sin-stock"
    if (sinStock) btnAgregar.disabled = true

    // Agregamos todos los elementos dentro del div de la tarjeta, y la tarjeta a la grilla
    div.append(img, nombre, precio, btnAgregar)
    grid.append(div)

    // ─── Evento: agregar al carrito ────────────────────────────────────────────
    btnAgregar.addEventListener("click", () => {

        // Buscamos si el producto ya está en el carrito por su id
        const encontrado = carrito.find(el => el.id === producto.id)

        if (encontrado) {
            // Si ya existe, solo sumamos una unidad
            encontrado.cantidad += 1
        } else {
            // Si no existe, lo agregamos con cantidad 1 (spread para no mutar el original)
            carrito.push({ ...producto, cantidad: 1 })
        }

        // Abrimos el carrito y lo volvemos a renderizar con el nuevo estado
        abrirCarrito()
        renderCarrito()
    })
})

// ─── Función: renderizar el carrito ───────────────────────────────────────────
function renderCarrito() {

    // Guardamos una referencia al footer antes de limpiar el contenedor
    const footer = contenedorCarrito.querySelector(".sidebar-footer")

    // Vaciamos el contenedor nodo por nodo (equivalente a innerHTML = "" pero sin usar HTML)
    while (contenedorCarrito.firstChild) {
        contenedorCarrito.removeChild(contenedorCarrito.firstChild)
    }

    // Volvemos a insertar el footer que habíamos guardado
    contenedorCarrito.appendChild(footer)

    // Si el carrito está vacío mostramos un mensaje y reseteamos el total
    if (carrito.length === 0) {
        const vacio = document.createElement("p")
        vacio.textContent = "El carrito está vacío"
        vacio.style.cssText = "font-size:12px;color:var(--text-light);text-align:center;padding:20px 0;"
        contenedorCarrito.insertBefore(vacio, footer)
        totalVal.textContent = "$0"
        return
    }

    // Usamos un fragmento para armar todos los ítems en memoria antes de insertarlos al DOM
    // (Esto evita múltiples reflows/repaints, es más eficiente)
    const frag = document.createDocumentFragment()

    // Iteramos sobre cada producto en el carrito y creamos su fila
    carrito.forEach((el) => {

        // Fila contenedora del ítem
        const item = document.createElement("div")

        // Nombre del producto
        const nombre = document.createElement("span")
        nombre.style.cssText = "flex:1;font-size:11px;"
        nombre.textContent = el.nombre

        // Precio total del ítem (precio × cantidad)
        const precio = document.createElement("span")
        precio.style.fontFamily = "'Cinzel',serif"
        precio.style.color      = "var(--gold)"
        precio.style.fontSize   = "12px"
        precio.textContent      = `$${el.precio * el.cantidad}`

        // Botón para sumar una unidad
        const btnSuma = document.createElement("button")
        btnSuma.className    = "btn-suma"
        btnSuma.dataset.id   = el.id  // Guardamos el id en el dataset para identificarlo después
        btnSuma.title        = "Sumar"
        btnSuma.textContent  = "+"

        // Botón para restar una unidad
        const btnResta = document.createElement("button")
        btnResta.className   = "btn-resta"
        btnResta.dataset.id  = el.id
        btnResta.title       = "Restar"
        btnResta.textContent = "-"

        // Botón para eliminar el ítem del carrito
        const btnEliminar = document.createElement("button")
        btnEliminar.className   = "btn-eliminar"
        btnEliminar.dataset.id  = el.id
        btnEliminar.title       = "Eliminar"
        btnEliminar.textContent = "✕"

        // Armamos la fila con todos sus elementos y la agregamos al fragmento
        item.append(nombre, precio, btnSuma, btnResta, btnEliminar)
        frag.append(item)
    })

    // Insertamos el fragmento completo en el DOM, antes del footer
    contenedorCarrito.insertBefore(frag, footer)

    // Calculamos el total sumando precio × cantidad de cada ítem
    const total = carrito.reduce((acc, el) => acc + el.precio * el.cantidad, 0)
    totalVal.textContent = `$${total}`

    // Solo creamos el botón "Finalizar compra" si todavía no existe en el footer
    if (!contenedorCarrito.querySelector(".btn-finalizar")) {
        const btnFinalizar = document.createElement("button")
        btnFinalizar.textContent  = "Finalizar compra"
        btnFinalizar.className    = "btn-finalizar"
        btnFinalizar.style.cssText = "width:100%;margin-top:10px;font-family:'Lato',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:9px 0;border:none;border-radius:2px;background:var(--gold);color:#fff;cursor:pointer;font-weight:700;"
        btnFinalizar.addEventListener("click", finalizarCompra)
        footer.appendChild(btnFinalizar)
    }
}

// ─── Evento: delegación de clics dentro del carrito ───────────────────────────
// En lugar de poner un listener en cada botón, escuchamos en el contenedor padre
// y detectamos en cuál botón se hizo clic por su clase (event delegation)
contenedorCarrito.addEventListener("click", (e) => {

    const isSuma     = e.target.classList.contains("btn-suma")
    const isResta    = e.target.classList.contains("btn-resta")
    const isEliminar = e.target.classList.contains("btn-eliminar")

    // Si el clic no fue en ninguno de nuestros botones, ignoramos el evento
    if (!isSuma && !isResta && !isEliminar) return

    // Obtenemos el id del producto desde el dataset del botón clickeado
    const id    = parseInt(e.target.dataset.id)
    const el    = carrito.find(x => x.id === id)      // El objeto del producto en el carrito
    const index = carrito.findIndex(x => x.id === id) // Su posición en el array

    if (!el) return // Salimos si por algún motivo no se encontró el producto

    if      (isSuma)                     el.cantidad += 1          // Suma: incrementamos cantidad
    else if (isResta && el.cantidad > 1) el.cantidad -= 1          // Resta con más de 1: decrementamos
    else if (isResta || isEliminar)      carrito.splice(index, 1)  // Resta en 1 o eliminar: sacamos del array

    // Volvemos a renderizar el carrito con el estado actualizado
    renderCarrito()
})

// ─── Funciones: abrir y cerrar el carrito ─────────────────────────────────────
function abrirCarrito() {
    contenedorCarrito.style.display = "flex"  // Mostramos el sidebar
    overlay.classList.add("active")            // Activamos el fondo oscuro
}

function cerrarCarrito() {
    contenedorCarrito.style.display = "none"   // Ocultamos el sidebar
    overlay.classList.remove("active")         // Desactivamos el fondo oscuro
}

// ─── Evento: toggle del carrito al hacer clic en el ícono ─────────────────────
cartBtn.addEventListener("click", () => {
    // Si ya está abierto lo cerramos, si no lo abrimos
    const estaAbierto = contenedorCarrito.style.display === "flex"
    estaAbierto ? cerrarCarrito() : abrirCarrito()
})

// ─── Evento: cerrar carrito al hacer clic en el overlay ───────────────────────
overlay.addEventListener("click", cerrarCarrito)

// ─── Función: finalizar la compra ─────────────────────────────────────────────
function finalizarCompra() {
    if (carrito.length === 0) return  // No hacemos nada si el carrito está vacío
    cerrarCarrito()                   // Cerramos el sidebar
    modal.classList.add("open")       // Abrimos el modal de confirmación
}

// ─── Evento: cerrar el modal de confirmación ──────────────────────────────────
modalClose.addEventListener("click", () => {
    modal.classList.remove("open")
})
