import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const usuarioStr = localStorage.getItem('usuario');

    if (!usuarioStr) {
      router.navigate(['/login']);
      return false;
    }

    const usuario = JSON.parse(usuarioStr);

    // Si el usuario no tiene un rol permitido para esta ruta, lo redirigimos a su vista principal
    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
      if (usuario.rol === 'Cajero' || usuario.rol === 'Vendedor') {
        router.navigate(['/pos']);
      } else {
        router.navigate(['/inventario']);
      }
      return false;
    }

    return true;
  };
};