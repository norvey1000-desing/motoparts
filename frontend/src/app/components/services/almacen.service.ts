import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {

  // ⚠️ En Capacitor/APK debes usar la URL absoluta de tu backend en Render:
  private apiUrl = `${environment.apiUrl}/api`; // Reemplaza con tu URL real de Render

  constructor(private http: HttpClient) {}

  login(credentials: any) {
  return this.http.post(`${this.apiUrl}/login`, credentials);
}

  // --- Métodos de Usuarios ---
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }
  
  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }
  
  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
  }
  
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // --- Métodos de Productos ---
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }

  agregarProducto(producto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, producto);
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }

  // --- Métodos de Ventas y Contabilidad ---
  getVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ventas`);
  }

  getVentasPorMetodoPago(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contabilidad/por-metodo-pago`);
  }

  registrarVenta(ventaData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ventas`, ventaData);
  }

  getDetalleVenta(ventaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ventas/${ventaId}/detalle`);
  }
}