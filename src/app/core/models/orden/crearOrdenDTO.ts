import { DetalleOrdenDTO } from "./detalleOrdenDTO";

export interface CrearOrdenDTO {
  idCliente: number;
  fechaEntregaProgramada?: string;
  observaciones?: string;
  detalles: DetalleOrdenDTO[];
}
