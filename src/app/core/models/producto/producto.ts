import { UnidadMedidaSimple } from './unidadMedidaSimple';
import { CategoriaSimple } from './categoriaSimple';
import { EstadoProducto } from './estadoProducto';

export interface Producto {
  idProducto?: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaSimple;
  unidadMedida: UnidadMedidaSimple;
  stockActual: number;
  stockMinimo: number;
  stockMaximo?: number;
  requiereLote: boolean;
  diasVidaUtil?: number;
  imagenUrl?: string;
  estado: EstadoProducto;
  stockBajo: boolean;
  precioBase: number;
  precios: { [key: string]: number };
}
