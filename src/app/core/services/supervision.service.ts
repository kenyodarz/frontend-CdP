import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSupervision } from '../models/supervision/dashboardSupervision';
import { AprobacionOrden } from '../models/supervision/aprobacionOrden';
import { AprobacionDespacho } from '../models/supervision/aprobacionDespacho';
import { AsignacionRuta } from '../models/supervision/asignacionRuta';
import { ValidacionInventario } from '../models/supervision/validacionInventario';

@Injectable({
  providedIn: 'root'
})
export class SupervisionService {
  private apiUrl = `${environment.apiUrl}/supervision`;

  constructor(private http: HttpClient) { }

  // ========== Dashboard ==========

  obtenerDashboard(idSupervisor: number): Observable<DashboardSupervision> {
    const params = new HttpParams().set('idSupervisor', idSupervisor.toString());
    return this.http.get<DashboardSupervision>(`${this.apiUrl}/dashboard`, { params });
  }

  // ========== Órdenes ==========

  aprobarOrden(idOrden: number, idSupervisor: number, comentarios?: string): Observable<AprobacionOrden> {
    const params = new HttpParams().set('idSupervisor', idSupervisor.toString());
    const body = comentarios ? { comentarios } : {};
    return this.http.post<AprobacionOrden>(
      `${this.apiUrl}/ordenes/${idOrden}/aprobar`,
      body,
      { params }
    );
  }

  rechazarOrden(idOrden: number, idSupervisor: number, motivo: string): Observable<AprobacionOrden> {
    const params = new HttpParams().set('idSupervisor', idSupervisor.toString());
    return this.http.post<AprobacionOrden>(
      `${this.apiUrl}/ordenes/${idOrden}/rechazar`,
      { motivo },
      { params }
    );
  }

  // ========== Despachos ==========

  aprobarDespacho(idDespacho: number, idSupervisor: number, comentarios?: string): Observable<AprobacionDespacho> {
    const params = new HttpParams().set('idSupervisor', idSupervisor.toString());
    const body = comentarios ? { comentarios } : {};
    return this.http.post<AprobacionDespacho>(
      `${this.apiUrl}/despachos/${idDespacho}/aprobar`,
      body,
      { params }
    );
  }

  // ========== Rutas ==========

  asignarRuta(
    idRuta: number,
    idSupervisor: number,
    idConductor?: number,
    idVehiculo?: number,
    observaciones?: string
  ): Observable<AsignacionRuta> {
    const params = new HttpParams().set('idSupervisor', idSupervisor.toString());
    return this.http.post<AsignacionRuta>(
      `${this.apiUrl}/rutas/${idRuta}/asignar`,
      { idConductor, idVehiculo, observaciones },
      { params }
    );
  }

  // ========== Inventario ==========

  validarInventario(
    idDocumento: number,
    idSupervisor: number,
    aprobado: boolean,
    discrepancias?: { [key: string]: any },
    comentarios?: string
  ): Observable<ValidacionInventario> {
    const params = new HttpParams().set('idSupervisor', idSupervisor.toString());
    return this.http.post<ValidacionInventario>(
      `${this.apiUrl}/inventario/${idDocumento}/validar`,
      { aprobado, discrepancias, comentarios },
      { params }
    );
  }
}
