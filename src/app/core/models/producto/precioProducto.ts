import {TipoTarifa} from './tipoTarifa';

export interface PrecioProducto {
  idPrecio?: number;
  tipoTarifa: TipoTarifa;
  precio: number;
}
