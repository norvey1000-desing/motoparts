import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AlmacenService  } from '../services/almacen.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    CommonModule, 
    FormsModule // 👈 2. Agregarlo al array de imports
    
  ],
 
})
export class LoginComponent {
  cargando: boolean = false;
  errorLogin: string = '';
  
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AlmacenService, 
    private router: Router,
    private zone: NgZone // <-- Inyectar NgZone para refrescar la interfaz
  ) {}

 iniciarSesion(): void {
  this.cargando = true;
  this.errorLogin = '';

  this.authService.login(this.credentials).pipe(
    finalize(() => {
      // 👈 Este bloque se ejecuta SIEMPRE (éxito o error), liberando el botón de inmediato
      this.zone.run(() => {
        this.cargando = false;
      });
    })
  ).subscribe({
    next: (res: any) => {
      this.zone.run(() => {
        if (res && res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          this.router.navigate(['/inventario']);
        } else {
          this.errorLogin = res?.message || 'Credenciales inválidas.';
        }
      });
    },
    error: (err: any) => {
      this.zone.run(() => {
        console.error('Error detallado de login:', err);
        if (err.status === 401) {
          this.errorLogin = 'Correo o contraseña incorrectos.';
        } else {
          this.errorLogin = 'No se pudo conectar con el servidor.';
        }
      });
    }
  });
}
}