import {ProductoDetalle} from './productoDetalle';

export interface DetalleOrden {
  idDetalle?: number;
  producto: ProductoDetalle;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
