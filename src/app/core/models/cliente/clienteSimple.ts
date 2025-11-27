import {EstadoGeneral} from './estadoGeneral';
import {TipoTarifa} from '../producto/tipoTarifa';

export interface ClienteSimple {
  idCliente: number;
  nombre: string;
  codigo?: string;
  telefono?: string;
  barrio?: string;
  tipoTarifa: TipoTarifa;
  ruta?: string;
  estado: EstadoGeneral;
}
