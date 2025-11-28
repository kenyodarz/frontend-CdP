import { EstadoProducto } from './estadoProducto';

export interface ProductoSimple {
  idProducto: number;
  codigo?: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
  precio0D: number;
  estado: EstadoProducto;
  diasVidaUtil?: number; // Para cálculo de vencimiento de lotes
}
