import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenService } from '../services/almacen.service';
import { NavbarComponent } from '../nadvar/navbar.component';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './contabilidad.component.html',
})
export class ContabilidadComponent implements OnInit {
  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  facturaSeleccionada: any = null;
  mostrarFacturaModal: boolean = false;
  
  // Variables de filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  filtroCliente: string = '';
  filtroMetodoPago: string = 'TODOS';

  cargando: boolean = false;
  errorMensaje: string = '';

  constructor(private almacenService: AlmacenService) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando = true;
    this.errorMensaje = '';
    
    this.almacenService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data || [];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al conectar con la API de ventas:', err);
        this.errorMensaje = 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.ventasFiltradas = this.ventas.filter(v => {
      let cumple = true;

      if (v.fecha) {
        const fechaVenta = v.fecha.split('T')[0].split(' ')[0];
        if (this.fechaInicio && fechaVenta < this.fechaInicio) cumple = false;
        if (this.fechaFin && fechaVenta > this.fechaFin) cumple = false;
      }

      if (this.filtroCliente.trim() !== '') {
        const clienteVenta = (v.cliente || 'Cliente General').toLowerCase();
        const busqueda = this.filtroCliente.toLowerCase().trim();
        if (!clienteVenta.includes(busqueda)) cumple = false;
      }

      if (this.filtroMetodoPago !== 'TODOS') {
        const metodoVenta = (v.metodo_pago || '').toLowerCase();
        if (metodoVenta !== this.filtroMetodoPago.toLowerCase()) cumple = false;
      }

      return cumple;
    });
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.filtroCliente = '';
    this.filtroMetodoPago = 'TODOS';
    this.ventasFiltradas = [...this.ventas];
  }

  get totalIngresos(): number {
    return this.ventasFiltradas.reduce((sum, v) => sum + (Number(v.total) || 0), 0);
  }

  get totalEfectivo(): number {
    return this.ventasFiltradas
      .filter(v => (v.metodo_pago || '').toLowerCase() === 'efectivo')
      .reduce((sum, v) => sum + (Number(v.total) || 0), 0);
  }

  get totalTarjeta(): number {
    return this.ventasFiltradas
      .filter(v => (v.metodo_pago || '').toLowerCase() === 'tarjeta')
      .reduce((sum, v) => sum + (Number(v.total) || 0), 0);
  }

  get totalTransferencia(): number {
    return this.ventasFiltradas
      .filter(v => (v.metodo_pago || '').toLowerCase() === 'transferencia')
      .reduce((sum, v) => sum + (Number(v.total) || 0), 0);
  }

  verFactura(venta: any): void {
    const ventaId = venta.id_venta || venta.id;
    
    this.facturaSeleccionada = {
      id: ventaId,
      fecha: venta.fecha,
      cliente: venta.cliente || 'Cliente General',
      vendedor: venta.vendedor || 'Admin',
      metodoPago: venta.metodo_pago || venta.metodoPago,
      total: venta.total,
      items: []
    };
    
    this.mostrarFacturaModal = true;

    this.almacenService.getDetalleVenta(ventaId).subscribe({
      next: (items: any[]) => {
        if (this.facturaSeleccionada) {
          this.facturaSeleccionada.items = items || [];
        }
      },
      error: (err) => {
        console.error('Error al cargar detalle de venta:', err);
      }
    });
  }

  imprimirFactura(): void {
    window.print();
  }

  cerrarModal(): void {
    this.mostrarFacturaModal = false;
    this.facturaSeleccionada = null;
  }
}