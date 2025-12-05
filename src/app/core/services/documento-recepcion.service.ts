import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DocumentoRecepcion,
  CrearDocumentoRecepcionDTO,
  AnularDocumentoDTO,
  EstadoDocumento
} from '../models/inventario/documento-recepcion';

@Injectable({
  providedIn: 'root'
})
export class DocumentoRecepcionService {
  private apiUrl = `${environment.apiUrl}/inventario/documentos-recepcion`;

  constructor(private http: HttpClient) { }

  crear(documento: CrearDocumentoRecepcionDTO): Observable<DocumentoRecepcion> {
    return this.http.post<DocumentoRecepcion>(this.apiUrl, documento);
  }

  confirmar(id: number): Observable<DocumentoRecepcion> {
    return this.http.post<DocumentoRecepcion>(`${this.apiUrl}/${id}/confirmar`, {});
  }

  anular(id: number, dto: AnularDocumentoDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/anular`, dto);
  }

  obtenerPorId(id: number): Observable<DocumentoRecepcion> {
    return this.http.get<DocumentoRecepcion>(`${this.apiUrl}/${id}`);
  }

  listar(
    estado?: EstadoDocumento,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<DocumentoRecepcion[]> {
    let params = new HttpParams();

    if (estado) {
      params = params.set('estado', estado);
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<DocumentoRecepcion[]>(this.apiUrl, { params });
  }
}
