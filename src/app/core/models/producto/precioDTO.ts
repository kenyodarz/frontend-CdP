import {TipoTarifa} from './tipoTarifa';

/**
 * DTO para enviar precios al crear/actualizar productos
 * No incluye idPrecio ya que es asignado por el backend
 */
export interface PrecioDTO {
  tipoTarifa: TipoTarifa;
  precio: number;
}
