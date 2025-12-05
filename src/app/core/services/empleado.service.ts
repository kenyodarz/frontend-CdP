import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { EmpleadoOrden } from '../models/orden/empleadoOrden';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/empleados`;

  obtenerPorId(id: number): Observable<EmpleadoOrden> {
    return this.http.get<EmpleadoOrden>(`${this.apiUrl}/${id}`);
  }
}
