import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DocumentoSalida} from '../models/documento-salida.model';
import {CrearDocumentoSalidaDTO} from '../models/crear-documento-salida-dto.model';
import {EstadoDocumentoSalida} from '../models/estado-documento-salida.enum';
import {ValidacionStockResult} from '../models/validacion-stock-result.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentoSalidaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventario/documentos-salida`;

  /**
   * Crear nuevo documento de salida
   */
  crear(dto: CrearDocumentoSalidaDTO): Observable<DocumentoSalida> {
    return this.http.post<DocumentoSalida>(this.apiUrl, dto);
  }

  /**
   * Agregar órdenes a documento existente (solo si PENDIENTE)
   */
  agregarOrdenes(id: number, idsOrdenes: number[]): Observable<DocumentoSalida> {
    return this.http.post<DocumentoSalida>(`${this.apiUrl}/${id}/agregar-ordenes`, idsOrdenes);
  }

  /**
   * Cambiar estado del documento
   */
  cambiarEstado(
    id: number,
    estado: EstadoDocumentoSalida,
    idEmpleado: number
  ): Observable<DocumentoSalida> {
    let params = new HttpParams()
      .set('estado', estado)
      .set('idEmpleado', idEmpleado.toString());

    return this.http.post<DocumentoSalida>(`${this.apiUrl}/${id}/cambiar-estado`, null, { params });
  }

  /**
   * Validar stock disponible para despacho
   */
  validarStock(id: number): Observable<ValidacionStockResult> {
    return this.http.get<ValidacionStockResult>(`${this.apiUrl}/${id}/validar-stock`);
  }

  /**
   * Despachar documento (ejecuta FIFO y genera movimientos)
   */
  despachar(id: number, idEmpleado: number): Observable<DocumentoSalida> {
    let params = new HttpParams().set('idEmpleado', idEmpleado.toString());
    return this.http.post<DocumentoSalida>(`${this.apiUrl}/${id}/despachar`, null, { params });
  }

  /**
   * Listar documentos con filtros opcionales
   */
  listar(
    estado?: EstadoDocumentoSalida,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Observable<DocumentoSalida[]> {
    let params = new HttpParams();

    if (estado) {
      params = params.set('estado', estado);
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', this.formatDate(fechaInicio));
    }
    if (fechaFin) {
      params = params.set('fechaFin', this.formatDate(fechaFin));
    }

    return this.http.get<DocumentoSalida[]>(this.apiUrl, { params });
  }

  /**
   * Listar documentos por ruta
   */
  listarPorRuta(idRuta: number): Observable<DocumentoSalida[]> {
    return this.http.get<DocumentoSalida[]>(`${this.apiUrl}/ruta/${idRuta}`);
  }

  /**
   * Obtener documento por ID
   */
  obtenerPorId(id: number): Observable<DocumentoSalida> {
    return this.http.get<DocumentoSalida>(`${this.apiUrl}/${id}`);
  }

  /**
   * Descargar PDF del documento
   */
  descargarPdf(id: number): Observable<Blob> {
    const url = `${this.apiUrl}/${id}/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Descargar Hoja de Ruta PDF
   */
  descargarHojaRuta(id: number): Observable<Blob> {
    const url = `${this.apiUrl}/${id}/hoja-ruta`;
    return this.http.get(url, {responseType: 'blob'});
  }

  /**
   * Formatea fecha para backend (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
