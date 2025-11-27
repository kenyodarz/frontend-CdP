import {EstadoOrden} from './estadoOrden';

export interface OrdenDespachoSimple {
  idOrden: number;
  numeroOrden: string;
  clienteNombre: string;
  fechaOrden: string;
  total: number;
  estado: EstadoOrden;
  cantidadProductos: number;
}
