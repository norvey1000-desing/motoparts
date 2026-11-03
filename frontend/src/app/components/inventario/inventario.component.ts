import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlmacenService } from '../services/almacen.service';
import { NavbarComponent } from '../nadvar/navbar.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, ],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  busquedaProducto: string = '';
  mostrarModal: boolean = false;
  editando: boolean = false;
  cargando: boolean = false; // 👈 Variable para controlar el estado de envío y evitar bloqueos
  
  formProducto: any = { 
    id: null, 
    codigo: '', 
    nombre: '', 
    categoria: '', 
    costo: 0, 
    precio: 0, 
    stock: 0 
  };

  constructor(private almacenService: AlmacenService, private router: Router) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.almacenService.getProductos().subscribe({
      next: (data: any[]) => {
        console.log('✅ Productos recibidos en el componente:', data);
        this.productos = data || [];
        this.filtrarProductos();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar productos:', err);
      }
    });
  }
   // 👇 Método para filtrar productos en tiempo real
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

  abrirModalNuevo(): void {
    this.editando = false;
    this.cargando = false;
    this.formProducto = { id: null, codigo: '', nombre: '', categoria: '', costo: 0, precio: 0, stock: 0 };
    this.mostrarModal = true;
  }

  abrirModalEditar(prod: any): void {
    this.editando = true;
    this.cargando = false;
    this.formProducto = { ...prod };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cargando = false;
  }

  guardarProducto(): void {
    // Validaciones locales iniciales
    if (!this.formProducto.codigo || !this.formProducto.nombre) {
      alert('El código y el nombre del producto son obligatorios.');
      return;
    }

    if (this.cargando) return;
    this.cargando = void 0 !== true; // Bloqueo de doble clic
    this.cargando = true;
    
    if (this.editando) {
      this.almacenService.actualizarProducto(this.formProducto.id, this.formProducto).subscribe({
        next: () => { 
          this.cargando = false; // 👈 Libera el formulario
          this.cargarProductos(); 
          this.cerrarModal(); 
        },
        error: (err: any) => {
          this.cargando = false; // 👈 ¡Crucial! Libera el formulario incluso si hay error
          alert(err.error?.error || 'Error al actualizar el producto');
        }
      });
    } else {
      this.almacenService.agregarProducto(this.formProducto).subscribe({
        next: () => { 
          this.cargando = false; // 👈 Libera el formulario
          this.cargarProductos(); 
          this.cerrarModal(); 
        },
        error: (err: any) => {
          this.cargando = false; // 👈 ¡Crucial! Libera el formulario incluso si hay error
          alert(err.error?.error || 'No se pudo guardar el producto. Verifica que el código no esté duplicado.');
        }
      });
    }
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.almacenService.eliminarProducto(id).subscribe({
        next: () => this.cargarProductos(),
        error: (err: any) => alert('No se pudo eliminar el producto')
      });
    }
  }
}