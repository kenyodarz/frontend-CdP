import { ProductoDetalle } from './productoDetalle';

export interface DetalleOrden {
  idDetalle?: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
