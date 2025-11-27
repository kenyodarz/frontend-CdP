import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {CrearLoteDTO} from '../models/inventario/crearLoteDTO';
import {Lote} from '../models/inventario/lote';
import {RegistrarEntradaDTO} from '../models/inventario/registrarEntradaDTO';
import {MovimientoInventario} from '../models/inventario/movimientoInventario';
import {RegistrarSalidaDTO} from '../models/inventario/registrarSalidaDTO';
import {TipoMovimiento} from '../models/inventario/tipoMovimiento';

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

  obtenerLotesPorProducto(idProducto: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.apiUrlLotes}/producto/${idProducto}`);
  }

  obtenerProximosAVencer(dias: number = 3): Observable<Lote[]> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<Lote[]>(`${this.apiUrlLotes}/proximos-vencer`, {params});
  }

  obtenerVencidos(): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.apiUrlLotes}/vencidos`);
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

  obtenerMovimientos(tipo?: TipoMovimiento, fecha?: string): Observable<MovimientoInventario[]> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<MovimientoInventario[]>(this.apiUrlMovimientos, {params});
  }
}
