import {TipoDocumento} from './tipoDocumento';
import {TipoTarifa} from '../producto/tipoTarifa';

export interface CrearClienteDTO {
  nombre: string;
  codigo?: string;
  tipoDocumento?: TipoDocumento;
  numeroDocumento?: string;
  direccion?: string;
  telefono?: string;
  barrio?: string;
  comuna?: string;
  tipoNegocio?: string;
  tipoTarifa: TipoTarifa;
  idRuta?: number;
  idConductor?: number;
  horarioEntrega?: string;
}
