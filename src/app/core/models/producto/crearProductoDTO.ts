import { PrecioDTO } from './precioDTO';

export interface CrearProductoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  idCategoria: number;
  idUnidad: number;
  stockActual?: number;
  stockMinimo: number;
  stockMaximo?: number;
  requiereLote: boolean;
  diasVidaUtil?: number;
  imagenUrl?: string;
  precios: PrecioDTO[];
}
