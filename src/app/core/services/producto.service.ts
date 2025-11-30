import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoSimple } from '../models/producto/productoSimple';
import { Producto } from '../models/producto/producto';
import { CrearProductoDTO } from '../models/producto/crearProductoDTO';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  obtenerTodos(): Observable<ProductoSimple[]> {
    return this.http.get<ProductoSimple[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  buscarPorNombre(nombre: string): Observable<ProductoSimple[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<ProductoSimple[]>(`${this.apiUrl}/buscar`, { params });
  }

  obtenerConStockBajo(): Observable<ProductoSimple[]> {
    return this.http.get<ProductoSimple[]>(`${this.apiUrl}/stock-bajo`);
  }

  crear(producto: CrearProductoDTO): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizar(id: number, producto: CrearProductoDTO): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  ajustarStock(id: number, nuevaCantidad: number, motivo: string): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}/ajustar-stock`, {
      nuevaCantidad,
      motivo
    });
  }
}
