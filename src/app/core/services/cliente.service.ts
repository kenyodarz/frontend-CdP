import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Cliente } from '../models/cliente/cliente';
import { CrearClienteDTO } from '../models/cliente/crearClienteDTO';
import { ClienteSimple } from '../models/cliente/clienteSimple';
import { PageResponse } from '../models/common/page-response';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  /**
   * Obtiene todos los clientes activos de forma paginada.
   * @param page Número de página (0-based, default: 0)
   * @param size Tamaño de página (default: 10)
   * @returns Observable con la respuesta paginada de clientes
   */
  obtenerTodos(page: number = 0, size: number = 10): Observable<PageResponse<Cliente>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Cliente>>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  buscarPorNombre(nombre: string): Observable<ClienteSimple[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<ClienteSimple[]>(`${this.apiUrl}/buscar`, { params });
  }

  obtenerPorRuta(idRuta: number): Observable<ClienteSimple[]> {
    return this.http.get<ClienteSimple[]>(`${this.apiUrl}/ruta/${idRuta}`);
  }

  obtenerPorBarrio(barrio: string): Observable<ClienteSimple[]> {
    return this.http.get<ClienteSimple[]>(`${this.apiUrl}/barrio/${barrio}`);
  }

  crear(cliente: CrearClienteDTO): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(id: number, cliente: any): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  asignarRuta(id: number, idRuta: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/asignar-ruta`, { idRuta });
  }

  asignarConductor(id: number, idConductor: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/asignar-conductor`, { idConductor });
  }

  desactivar(id: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/desactivar`, {});
  }
}
