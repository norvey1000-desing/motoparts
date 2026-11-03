import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlmacenService } from '../services/almacen.service';
import { NavbarComponent } from '../nadvar/navbar.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  mostrarModal: boolean = false;
  editando: boolean = false;
  formUsuario: any = { id: null, email: '', password: '', nombre: '', rol: 'Cajero' };

  constructor(private almacenService: AlmacenService, private router: Router) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.almacenService.getUsuarios().subscribe({
      next: (data: any[]) => this.usuarios = data,
      error: (err: any) => console.error('Error al cargar usuarios:', err)
    });
  }

  abrirModalNuevo(): void {
    this.editando = false;
    this.formUsuario = { id: null, email: '', password: '', nombre: '', rol: 'Cajero' };
    this.mostrarModal = true;
  }

  abrirModalEditar(usu: any): void {
    this.editando = true;
    this.formUsuario = { id: usu.id, email: usu.email, password: '', nombre: '', rol: usu.rol };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarUsuario(): void {
    if (this.editando) {
      this.almacenService.actualizarUsuario(this.formUsuario.id, this.formUsuario).subscribe({
        next: () => { this.cargarUsuarios(); this.cerrarModal(); },
        error: (err: any) => alert('Error al actualizar usuario')
      });
    } else {
      this.almacenService.crearUsuario(this.formUsuario).subscribe({
        next: () => { this.cargarUsuarios(); this.cerrarModal(); },
        error: (err: any) => alert('Error al crear usuario')
      });
    }
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Deseas eliminar este usuario del sistema?')) {
      this.almacenService.eliminarUsuario(id).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err: any) => alert('No se pudo eliminar el usuario')
      });
    }
  }

  irInventario(): void { this.router.navigate(['/inventario']); }
  irPOS(): void { this.router.navigate(['/pos']); }
  cerrarSesion(): void { localStorage.removeItem('usuario'); this.router.navigate(['/login']); }
}