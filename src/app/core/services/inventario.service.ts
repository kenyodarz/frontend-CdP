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
}
