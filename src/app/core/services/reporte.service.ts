import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {DashboardData} from '../models/reporte/dashboardData';
import {ReporteVentas} from '../models/reporte/reporteVentas';
import {ProductoVendido} from '../models/reporte/productoVendido';
import {ClienteTop} from '../models/reporte/clienteTop';
import {ReporteInventario} from '../models/reporte/reporteInventario';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  obtenerDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  reporteVentas(fechaInicio: string, fechaFin: string): Observable<ReporteVentas> {
    const params = new HttpParams()
    .set('fechaInicio', fechaInicio)
    .set('fechaFin', fechaFin);
    return this.http.get<ReporteVentas>(`${this.apiUrl}/ventas`, {params});
  }

  productosMasVendidos(fechaInicio: string, fechaFin: string, limite: number = 10): Observable<ProductoVendido[]> {
    const params = new HttpParams()
    .set('fechaInicio', fechaInicio)
    .set('fechaFin', fechaFin)
    .set('limite', limite.toString());
    return this.http.get<ProductoVendido[]>(`${this.apiUrl}/productos-mas-vendidos`, {params});
  }

  clientesTop(fechaInicio: string, fechaFin: string, limite: number = 10): Observable<ClienteTop[]> {
    const params = new HttpParams()
    .set('fechaInicio', fechaInicio)
    .set('fechaFin', fechaFin)
    .set('limite', limite.toString());
    return this.http.get<ClienteTop[]>(`${this.apiUrl}/clientes-top`, {params});
  }

  inventarioValorizado(): Observable<ReporteInventario> {
    return this.http.get<ReporteInventario>(`${this.apiUrl}/inventario-valorizado`);
  }
}
