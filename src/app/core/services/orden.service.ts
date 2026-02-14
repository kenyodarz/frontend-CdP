import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {EstadoOrden} from '../models/orden/estadoOrden';
import {OrdenDespachoSimple} from '../models/orden/ordenDespachoSimple';
import {OrdenDespacho} from '../models/orden/ordenDespacho';
import {CrearOrdenDTO} from '../models/orden/crearOrdenDTO';
import {PageResponse} from '../models/common/page-response';

interface ResumenOrdenes {
  totalOrdenes: number;
  ordenesPendientes: number;
  ordenesEnPreparacion: number;
  ordenesListas: number;
  ordenesDespachadas: number;
  valorTotalOrdenes: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ordenes`;

  /**
   * Obtiene todas las órdenes de forma paginada con filtros opcionales.
   * @param page Número de página (0-based, default: 0)
   * @param size Tamaño de página (default: 10)
   * @param fecha Fecha opcional para filtrar
   * @param estado Estado opcional para filtrar
   * @returns Observable con la respuesta paginada de órdenes
   */
  obtenerTodas(page: number = 0, size: number = 10, term?: string, fecha?: string, estado?: EstadoOrden): Observable<PageResponse<OrdenDespachoSimple>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (term) params = params.set('term', term);
    if (fecha) params = params.set('fecha', fecha);
    if (estado) params = params.set('estado', estado);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        const content = response.content.map((item: any) => ({
          ...item,
          cantidadProductos: item.detalles ? item.detalles.length : 0,
          clienteNombre: item.nombreCliente || `Cliente #${item.idCliente}`
        }));
        return {
          ...response,
          content
        };
      })
    );
  }

  obtenerPorId(id: number): Observable<OrdenDespacho> {
    return this.http.get<OrdenDespacho>(`${this.apiUrl}/${id}`);
  }

  obtenerPorFecha(fecha: string): Observable<OrdenDespachoSimple[]> {
    return this.http.get<OrdenDespachoSimple[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  obtenerPorEstado(estado: EstadoOrden): Observable<OrdenDespachoSimple[]> {
    return this.http.get<OrdenDespachoSimple[]>(`${this.apiUrl}/estado/${estado}`);
  }

  obtenerPendientesHoy(): Observable<OrdenDespachoSimple[]> {
    return this.http.get<OrdenDespachoSimple[]>(`${this.apiUrl}/pendientes-hoy`);
  }

  obtenerHistorialCliente(idCliente: number, limite: number = 20): Observable<OrdenDespachoSimple[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<OrdenDespachoSimple[]>(`${this.apiUrl}/cliente/${idCliente}`, { params });
  }

  obtenerResumen(fecha?: string): Observable<ResumenOrdenes> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<ResumenOrdenes>(`${this.apiUrl}/resumen`, { params });
  }

  crear(orden: CrearOrdenDTO): Observable<OrdenDespacho> {
    return this.http.post<OrdenDespacho>(this.apiUrl, orden);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoOrden): Observable<OrdenDespacho> {
    return this.http.patch<OrdenDespacho>(`${this.apiUrl}/${id}/estado`, { nuevoEstado });
  }

  cancelar(id: number, motivo: string): Observable<OrdenDespacho> {
    return this.http.patch<OrdenDespacho>(`${this.apiUrl}/${id}/cancelar`, { motivo });
  }
}
