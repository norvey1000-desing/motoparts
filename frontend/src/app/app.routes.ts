import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { PosComponent } from './components/pos/pos.component'; // 👈 Asegúrate de que esté importado
import { UsuariosComponent } from './components/usuario/usuarios.component';
import { ContabilidadComponent } from './components/contabilidad/contabilidad.component';
import { authGuard } from './components/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'pos', 
    component: PosComponent,
    canActivate: [authGuard(['admin', 'Admin'])] // 👈 Ruta del POS añadida
  },
  { 
    path: 'inventario', 
    component: InventarioComponent,
    canActivate: [authGuard(['admin', 'Admin'])] 
  },
  { 
    path: 'usuarios', 
    component: UsuariosComponent,
    canActivate: [authGuard(['admin', 'Admin'])] 
  },
  { 
    path: 'contabilidad', 
    component: ContabilidadComponent,
    canActivate: [authGuard(['admin', 'Admin'])] 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];