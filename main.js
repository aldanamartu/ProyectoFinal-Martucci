// array de productos
let productos = null;
let carrito = localStorage.getItem("carrito");
let precio = localStorage.getItem("precio");

const actualizarLocalStorge = (carrito, precio) => {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("precio", JSON.stringify(precio));
}

const dibujarPrecio = (precio) => {
  document.getElementById("precio").innerHTML = `<h1><span class="badge bg-secondary">$${precio}</span></h1>`;
}

const dibujarItemCarrito = (elementoCarrito) => {
  let itemCarrito = document.createElement("item-carrito");

  //agrego el producto al carrito en el html
  itemCarrito.setAttribute("id", `item-${elementoCarrito.id}`);
  itemCarrito.innerHTML = `
          <div class="card" style="width: 18rem;">
            <img src="${elementoCarrito.imagen}" class="card-img-top" alt="${elementoCarrito.nombre}">
            <div class="card-body">
              <h5 class="card-title">${elementoCarrito.nombre}</h5>
              <p class="card-text">Cantidad <span id=item-${elementoCarrito.id}-cantidad>${elementoCarrito.cantidad}</span></p>
              <button class="btn btn-primary" id="eliminar-${elementoCarrito.id}" value="${elementoCarrito.id}">Eliminar del carrito</button>
            </div>
          </div>
          `;

  let carritoElement = document.getElementById("carrito");
  carritoElement.append(itemCarrito);

  itemCarrito.addEventListener("click", (event) => {
    event.preventDefault();
    let idProducto = parseInt(event.target.value);

    //busco el producto a borrar
    let carritoElement = carrito.filter(function (item) {
      return item.id == idProducto;
    });

    Swal.fire({
      title: 'Estas seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (carritoElement[0].cantidad === 1) {
          // borro elemento del carrito por id
          carrito = carrito.filter(i => i.id !== idProducto);
          console.log("CARRITO DESPUES DE BORRAR: " + JSON.stringify(carrito));
          // borro element del carrito por indice en el html
          document.getElementById(`item-${idProducto}`).remove();
        } else {
          carritoElement[0].cantidad -= 1;
          document.getElementById(`item-${carritoElement[0].id}-cantidad`).innerHTML = carritoElement[0].cantidad;
        }

        // actualizo el precio del carrito
        precio -= parseInt(carritoElement[0].precio);
        dibujarPrecio(precio);
        console.log("PRECIO: " + precio);

        actualizarLocalStorge(carrito, precio);

        Swal.fire(
          'Eliminado!',
          'Su producto ha sido eliminado del carrito.',
          'success'
        )
      }
    })
  });
}

const init = async () => {
  const response = await fetch("productos.json");
  productos = await response.json();

  if (precio) {
    precio = parseInt(precio);
  } else {
    precio = 0;
  }

  dibujarPrecio(precio);

  if (!carrito || carrito.length == 0) {
    carrito = [];
  } else {
    carrito = JSON.parse(carrito);
    carrito.forEach(item => {
      dibujarItemCarrito(item);
    });
  }
  
  // imprimo productos en el DOM
  productos.productos.forEach(item => {
    let producto = document.createElement("producto");
    producto.innerHTML = `
      <div class="card" style="width: 18rem;">
        <img src="${item.imagen}" class="card-img-top" alt="${item.nombre}">
        <div class="card-body">
          <h5 class="card-title">${item.nombre}</h5>
          <p class="card-text">$${item.precio}</p>
          <button class="btn btn-primary" id="agregar-${item.id}" value="${item.id}">Agregar a carrito</button>
        </div>
      </div>
    `;

    document.getElementById("productos").append(producto);

    // funcion que agrega productos al carrito
    producto.addEventListener("click", (event) => {
      event.preventDefault();
      let idProducto = event.target.value;
      let elemento = productos.productos.filter(function (item) {
        return item.id == idProducto;
      });

      if (elemento) {
        let elementoCarrito = JSON.parse(JSON.stringify(elemento[0]));
        let productoEnCarrito = carrito.filter(function (item) {
          return item.id == idProducto;
        });

        if (productoEnCarrito.length > 0) {
          console.log(`Encontre el producto ${productoEnCarrito[0].id} en el carrito`)
          productoEnCarrito[0].cantidad += 1;
          document.getElementById(`item-${productoEnCarrito[0].id}-cantidad`).innerHTML = productoEnCarrito[0].cantidad;
        } else {
          elementoCarrito.cantidad = 1;
          carrito.push(elementoCarrito);
          dibujarItemCarrito(elementoCarrito);
        }

        precio += parseInt(elementoCarrito.precio);
        dibujarPrecio(precio);
        console.log("PRECIO: " + precio);

        //actualizo el localstorage con el carrito y el precio
        actualizarLocalStorge(carrito, precio);

        Swal.fire({
          position: 'bottom-end',
          icon: 'success',
          title: `Agraste un ${elementoCarrito.nombre} al carrito!`,
          showConfirmButton: false,
          timer: 1500
        })
      }
    });
  });
}

init();