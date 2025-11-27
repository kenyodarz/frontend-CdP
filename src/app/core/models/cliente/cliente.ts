import {ConductorSimple} from './conductorSimple';
import {RutaSimple} from './rutaSimple';
import {EstadoGeneral} from './estadoGeneral';
import {TipoDocumento} from './tipoDocumento';
import {TipoTarifa} from '../producto/tipoTarifa';

export interface Cliente {
  idCliente?: number;
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
  ruta?: RutaSimple;
  conductor?: ConductorSimple;
  horarioEntrega?: string;
  estado: EstadoGeneral;
}
