import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {EstadoOrden} from '../models/orden/estadoOrden';
import {OrdenDespachoSimple} from '../models/orden/ordenDespachoSimple';
import {OrdenDespacho} from '../models/orden/ordenDespacho';
import {CrearOrdenDTO} from '../models/orden/crearOrdenDTO';

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

  obtenerTodas(fecha?: string, estado?: EstadoOrden): Observable<OrdenDespachoSimple[]> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    if (estado) params = params.set('estado', estado);
    return this.http.get<OrdenDespachoSimple[]>(this.apiUrl, {params});
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
    return this.http.get<OrdenDespachoSimple[]>(`${this.apiUrl}/cliente/${idCliente}`, {params});
  }

  obtenerResumen(fecha?: string): Observable<ResumenOrdenes> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<ResumenOrdenes>(`${this.apiUrl}/resumen`, {params});
  }

  crear(orden: CrearOrdenDTO): Observable<OrdenDespacho> {
    return this.http.post<OrdenDespacho>(this.apiUrl, orden);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoOrden): Observable<OrdenDespacho> {
    return this.http.patch<OrdenDespacho>(`${this.apiUrl}/${id}/estado`, {nuevoEstado});
  }

  cancelar(id: number, motivo: string): Observable<OrdenDespacho> {
    return this.http.patch<OrdenDespacho>(`${this.apiUrl}/${id}/cancelar`, {motivo});
  }
}
