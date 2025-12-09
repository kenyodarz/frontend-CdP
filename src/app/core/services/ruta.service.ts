import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";

export interface Ruta {
  idRuta: number;
  nombre: string;
  descripcion?: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class RutaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/rutas`;

  obtenerTodas(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Ruta> {
    return this.http.get<Ruta>(`${this.apiUrl}/${id}`);
  }
}
