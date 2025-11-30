import { EstadoProducto } from './estadoProducto';

export interface ProductoSimple {
  idProducto?: number;
  codigo?: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
  precioBase: number;
  categoria: string;
  unidad: string;
  estado: EstadoProducto;
  diasVidaUtil?: number;
}
