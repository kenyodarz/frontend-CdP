import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {Cliente} from '../models/cliente/cliente';
import {CrearClienteDTO} from '../models/cliente/crearClienteDTO';
import {ClienteSimple} from '../models/cliente/clienteSimple';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  obtenerTodos(): Observable<ClienteSimple[]> {
    return this.http.get<ClienteSimple[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  buscarPorNombre(nombre: string): Observable<ClienteSimple[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<ClienteSimple[]>(`${this.apiUrl}/buscar`, {params});
  }

  obtenerPorRuta(idRuta: number): Observable<ClienteSimple[]> {
    return this.http.get<ClienteSimple[]>(`${this.apiUrl}/ruta/${idRuta}`);
  }

  obtenerPorBarrio(barrio: string): Observable<ClienteSimple[]> {
    return this.http.get<ClienteSimple[]>(`${this.apiUrl}/barrio/${barrio}`);
  }

  crear(cliente: CrearClienteDTO): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(id: number, cliente: any): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  asignarRuta(id: number, idRuta: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/asignar-ruta`, {idRuta});
  }

  asignarConductor(id: number, idConductor: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/asignar-conductor`, {idConductor});
  }

  desactivar(id: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/desactivar`, {});
  }
}
