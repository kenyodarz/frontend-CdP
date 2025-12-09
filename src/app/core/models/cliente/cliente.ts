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
  idRuta?: number;
  nombreRuta?: string;
  idConductor?: number;
  nombreConductor?: string;
  horarioEntrega?: string;
  estado: EstadoGeneral;
}

