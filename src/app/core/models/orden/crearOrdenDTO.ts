import {DetalleOrdenDTO} from "./detalleOrdenDTO";

export interface CrearOrdenDTO {
  idCliente: number;
  idEmpleado: number;
  fechaEntregaProgramada?: string;
  descuento?: number;
  observaciones?: string;
  detalles: DetalleOrdenDTO[];
}
