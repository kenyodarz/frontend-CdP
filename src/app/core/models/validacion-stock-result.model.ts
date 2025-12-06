export interface ProductoFaltante {
  idProducto: number;
  nombreProducto: string;
  codigoProducto: string;
  cantidadNecesaria: number;
  stockDisponible: number;
  cantidadFaltante: number;
}

export interface ValidacionStockResult {
  valido: boolean;
  productosFaltantes: ProductoFaltante[];
}
