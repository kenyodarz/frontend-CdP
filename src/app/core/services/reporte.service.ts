import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { DashboardData } from '../models/reporte/dashboardData';
import { ReporteVentas } from '../models/reporte/reporteVentas';
import { ProductoVendido } from '../models/reporte/productoVendido';
import { ClienteTop } from '../models/reporte/clienteTop';
import { ReporteInventario } from '../models/reporte/reporteInventario';
import { DashboardProformaResponse } from '../models/reporte/dashboard-proforma';
import { ProductoSimple } from '../models/reporte/producto-simple';
import { ComparacionProducto } from '../models/reporte/comparacion-producto';
import { ProductoVendidoMes } from '../models/reporte/producto-vendido-mes';
import { ClienteBusqueda } from '../models/reporte/cliente-busqueda';
import { ProductoBusqueda } from '../models/reporte/producto-busqueda';
import { DetalleVenta } from '../models/reporte/detalle-venta';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  obtenerDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Obtiene datos del Dashboard Proforma 2025.
   * @param fechaInicio Fecha de inicio opcional (formato: YYYY-MM-DD)
   * @param fechaFin Fecha de fin opcional (formato: YYYY-MM-DD)
   * @returns Observable con los datos del dashboard
   */
  obtenerDashboardProforma(fechaInicio?: string, fechaFin?: string): Observable<DashboardProformaResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<DashboardProformaResponse>(`${this.apiUrl}/dashboard-proforma`, { params });
  }

  reporteVentas(fechaInicio: string, fechaFin: string): Observable<ReporteVentas> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<ReporteVentas>(`${this.apiUrl}/ventas`, { params });
  }

  productosMasVendidos(fechaInicio: string, fechaFin: string, limite: number = 10): Observable<ProductoVendido[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('limite', limite.toString());
    return this.http.get<ProductoVendido[]>(`${this.apiUrl}/productos-mas-vendidos`, { params });
  }

  clientesTop(fechaInicio: string, fechaFin: string, limite: number = 10): Observable<ClienteTop[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('limite', limite.toString());
    return this.http.get<ClienteTop[]>(`${this.apiUrl}/clientes-top`, { params });
  }

  inventarioValorizado(): Observable<ReporteInventario> {
    return this.http.get<ReporteInventario>(`${this.apiUrl}/inventario-valorizado`);
  }

  /**
   * Obtiene la lista de productos para filtros
   */
  getProductos(): Observable<ProductoSimple[]> {
    return this.http.get<ProductoSimple[]>(`${this.apiUrl}/productos`);
  }

  /**
   * Obtiene la lista de meses con ventas disponibles
   */
  getMesesDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/meses-disponibles`);
  }

  /**
   * Obtiene la comparación de ventas de un producto por año
   */
  getComparacionProducto(productoId: number, anio: number): Observable<ComparacionProducto> {
    const params = new HttpParams()
      .set('productoId', productoId.toString())
      .set('anio', anio.toString());
    return this.http.get<ComparacionProducto>(`${this.apiUrl}/comparacion-producto`, { params });
  }

  /**
   * Obtiene los productos vendidos en un mes específico
   */
  getProductosPorMes(mes: string): Observable<ProductoVendidoMes[]> {
    const params = new HttpParams().set('mes', mes);
    return this.http.get<ProductoVendidoMes[]>(`${this.apiUrl}/productos-por-mes`, { params });
  }

  /**
   * Busca clientes por nombre con estadísticas de compra
   */
  buscarClientes(query: string): Observable<ClienteBusqueda[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ClienteBusqueda[]>(`${this.apiUrl}/buscar-clientes`, { params });
  }

  /**
   * Busca productos por nombre con estadísticas de ventas
   */
  buscarProductos(query: string): Observable<ProductoBusqueda[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ProductoBusqueda[]>(`${this.apiUrl}/buscar-productos`, { params });
  }

  /**
   * Obtiene los detalles de ventas con filtros opcionales
   */
  getDetallesVentas(fechaDesde?: string, fechaHasta?: string, tipoCliente?: string, nombreCliente?: string): Observable<DetalleVenta[]> {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    if (tipoCliente) params = params.set('tipoCliente', tipoCliente);
    if (nombreCliente) params = params.set('nombreCliente', nombreCliente);
    return this.http.get<DetalleVenta[]>(`${this.apiUrl}/detalles-ventas`, { params });
  }
}
