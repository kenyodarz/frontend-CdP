import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { CrearLoteDTO } from '../models/inventario/crearLoteDTO';
import { Lote } from '../models/inventario/lote';
import { RegistrarEntradaDTO } from '../models/inventario/registrarEntradaDTO';
import { MovimientoInventario } from '../models/inventario/movimientoInventario';
import { RegistrarSalidaDTO } from '../models/inventario/registrarSalidaDTO';
import { TipoMovimiento } from '../models/inventario/tipoMovimiento';
import { MovimientoEntrada } from '../models/inventario/movimientoEntrada';
import { MovimientoSalida } from '../models/inventario/movimientoSalida';
import { CierreInventario } from '../models/inventario/cierreInventario';
import { Producto } from '../models/producto/producto';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlLotes = `${environment.apiUrl}/inventario/lotes`;
  private readonly apiUrlMovimientos = `${environment.apiUrl}/inventario/movimientos`;

  // ========== LOTES ==========
  crearLote(lote: CrearLoteDTO): Observable<Lote> {
    return this.http.post<Lote>(this.apiUrlLotes, lote);
  }

  obtenerTodosLotes(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.apiUrlLotes);
  }

  obtenerProximosAVencer(dias: number = 3): Observable<Lote[]> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<Lote[]>(`${this.apiUrlLotes}/proximos-vencer`, { params });
  }

  // ========== MOVIMIENTOS ==========
  registrarEntrada(entrada: RegistrarEntradaDTO): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrlMovimientos}/entrada`, entrada);
  }

  registrarSalida(salida: RegistrarSalidaDTO): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrlMovimientos}/salida`, salida);
  }

  obtenerHistorialProducto(idProducto: number): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrlMovimientos}/producto/${idProducto}`);
  }

  obtenerMovimientosPorFecha(fecha: string): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrlMovimientos}/fecha/${fecha}`);
  }

  obtenerMovimientos(fechaInicio?: string, fechaFin?: string): Observable<MovimientoInventario[]> {
    // Default to last 30 days if not specified
    const fin = fechaFin || new Date().toISOString().split('T')[0];
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const params = new HttpParams()
      .set('fechaInicio', inicio)
      .set('fechaFin', fin);

    return this.http.get<MovimientoInventario[]>(this.apiUrlMovimientos, { params });
  }

  // ========== CIERRES DE INVENTARIO ==========
  ejecutarCierreMensual(periodo: string, idUsuario: number): Observable<CierreInventario[]> {
    const params = new HttpParams()
      .set('periodo', periodo)
      .set('idUsuario', idUsuario.toString());

    return this.http.post<CierreInventario[]>(
      `${environment.apiUrl}/inventario/cierres/mensual`,
      null,
      { params }
    );
  }

  listarCierresPorPeriodo(periodo: string): Observable<CierreInventario[]> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<CierreInventario[]>(
      `${environment.apiUrl}/inventario/cierres`,
      { params }
    );
  }

  // ========== RECALCULAR STOCK ==========
  recalcularStockProducto(idProducto: number): Observable<Producto> {
    return this.http.post<Producto>(
      `${environment.apiUrl}/inventario/stock/recalcular/${idProducto}`,
      null
    );
  }

  recalcularStockTodos(): Observable<string> {
    return this.http.post(
      `${environment.apiUrl}/inventario/stock/recalcular-todos`,
      null,
      { responseType: 'text' }
    );
  }

  // ========== MOVIMIENTOS POR TIPO ==========
  listarMovimientosEntrada(idProducto: number): Observable<MovimientoEntrada[]> {
    return this.http.get<MovimientoEntrada[]>(
      `${environment.apiUrl}/inventario/movimientos/entrada/producto/${idProducto}`
    );
  }

  listarMovimientosSalida(idProducto: number): Observable<MovimientoSalida[]> {
    return this.http.get<MovimientoSalida[]>(
      `${environment.apiUrl}/inventario/movimientos/salida/producto/${idProducto}`
    );
  }
}
