import {ItemInventario} from './itemInventario';

export interface ReporteInventario {
  fecha: string;
  valorTotalInventario: number;
  numeroProductos: number;
  productosStockBajo: number;
  items: ItemInventario[];
}
