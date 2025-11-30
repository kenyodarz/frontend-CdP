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
  precioBase: number;
  precioJM?: number;
  precioCR?: number;
}
