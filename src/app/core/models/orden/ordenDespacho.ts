import { DetalleOrden } from './detalleOrden';
import { EmpleadoOrden } from './empleadoOrden';
import { ClienteOrden } from './clienteOrden';
import { EstadoOrden } from './estadoOrden';

export interface OrdenDespacho {
  idOrden?: number;
  numeroOrden: string;
  idCliente: number;
  idEmpleado: number;
  fechaOrden: string;
  fechaEntregaProgramada?: string;
  subtotal: number;
  descuento: number;
  total: number;
  observaciones?: string;
  estado: EstadoOrden;
  detalles: DetalleOrden[];
  cantidadProductos: number;
  puedeSerDespachada: boolean;
}
