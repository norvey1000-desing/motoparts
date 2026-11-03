import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  usuario: any = null;
  menuAbierto: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
    }
  }

  // Método que faltaba en el TypeScript
  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  @HostListener('document:click')
  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  irAUsuarios(): void {
    this.menuAbierto = false;
    this.router.navigate(['/usuarios']);
  }

  cerrarSesion(): void {
    this.menuAbierto = false;
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}