import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 1. Importarlo aquí
import { AlmacenService } from '../services/almacen.service';
import { NavbarComponent } from '../nadvar/navbar.component';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent ], // 👈 2. Agregarlo en el array de imports
  templateUrl: './pos.component.html',
})
export class PosComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  carrito: any[] = [];
  
  busquedaProducto: string = '';
  metodoPagoSeleccionado: string = 'Efectivo';
  total: number = 0;

  datosCliente = {
    nombre: ''
  };

  // Variables para controlar el Modal de Facturación
  mostrarFacturaModal: boolean = false;
  ultimaVenta: any = null;

  constructor(private almacenService: AlmacenService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.almacenService.getProductos().subscribe({
      next: (data : any) => {
        this.productos = data || [];
        this.filtrarProductos();
      },
      error: (err: any) => console.error('Error al cargar productos:', err)
    });
  }

  filtrarProductos(): void {
    const q = (this.busquedaProducto || '').toLowerCase().trim();
    if (!q) {
      this.productosFiltrados = [...this.productos];
      return;
    }
    this.productosFiltrados = this.productos.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(q)) ||
      (p.codigo && p.codigo.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q))
    );
  }

  agregarAlCarrito(producto: any): void {
    const index = this.carrito.findIndex(item => item.id === producto.id);
    if (index !== -1) {
      if (this.carrito[index].cantidad < producto.stock) {
        this.carrito[index].cantidad++;
      } else {
        alert('No hay suficiente stock disponible.');
      }
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    this.calcularTotal();
  }

  sumarCantidad(index: number): void {
    const item = this.carrito[index];
    if (item.cantidad < item.stock) {
      item.cantidad++;
      this.calcularTotal();
    } else {
      alert('Se ha alcanzado el límite del stock disponible.');
    }
  }

  restarCantidad(index: number): void {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad--;
    } else {
      this.eliminarDelCarrito(index);
    }
    this.calcularTotal();
  }

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.total = this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  finalizarVenta(): void {
    if (this.carrito.length === 0) return;

    // Obtenemos el vendedor activo (puedes guardarlo en localStorage al iniciar sesión)
    const usuarioActual = localStorage.getItem('usuarioEmail') || 'Admin';

    const payload = {
      total: this.total,
      cliente: this.datosCliente.nombre.trim() || 'Cliente General',
      vendedor: usuarioActual,
      metodoPago: this.metodoPagoSeleccionado,
      items: this.carrito
    };

    this.almacenService.registrarVenta(payload).subscribe({
      next: (res: any) => {
        // Guardamos los datos para mostrarlos en el modal de la factura en columnas
        this.ultimaVenta = {
          id: res.ventaId || '00',
          fecha: new Date().toLocaleString(),
          cliente: payload.cliente,
          vendedor: payload.vendedor,
          metodoPago: payload.metodoPago,
          total: payload.total,
          items: [...this.carrito]
        };

        // Activamos la vista del modal de factura
        this.mostrarFacturaModal = true;

        // Limpiamos el carrito y campos del POS
        this.carrito = [];
        this.total = 0;
        this.datosCliente = { nombre: '' };
        this.cargarProductos(); // Refresca el inventario y stock en pantalla
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        alert('❌ Error al procesar la venta en el servidor.');
      }
    });
  }
  // Método para limpiar todo y empezar una nueva venta
nuevaVenta(): void {
  this.carrito = [];                 // Vacía los productos del carrito
  this.total = 0;                    // Reinicia el total a 0
  this.datosCliente = { nombre: '' }; // Limpia el nombre del cliente correctamente sin usar null
  this.mostrarFacturaModal = false;  // Cierra/oculta el modal del ticket
  this.busquedaProducto = '';        // Limpia el buscador si lo deseas
  this.filtrarProductos();           // Refresca la lista de productos

  // Si tienes algún formulario de búsqueda o inputs adicionales, puedes limpiarlos aquí
}

  imprimirFactura(): void {
    window.print();
  }

  cerrarFacturaModal(): void {
    this.mostrarFacturaModal = false;
    this.ultimaVenta = null;
  }
}