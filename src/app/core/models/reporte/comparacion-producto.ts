export interface ComparacionProducto {
  productoId: number;
  productoNombre: string;
  totalUnidades: number;
  totalIngresos: number;
  precioPromedio: number;
  meses: VentaMensualProducto[];
}

export interface VentaMensualProducto {
  mes: string;
  cantidad: number;
  ingresos: number;
  precioPromedio: number;
}
