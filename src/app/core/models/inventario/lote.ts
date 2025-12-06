export interface Lote {
  id?: string;
  codigoLote: string;
  idProducto?: number;
  productoNombre?: string;
  cantidadInicial?: number;
  cantidadActual?: number;
  fechaElaboracion: string;
  fechaVencimiento?: string;
  estado: 'ACTIVO' | 'VENCIDO' | 'ANULADO';
  observaciones?: string;
  diasParaVencer?: number;
  estaProximoAVencer?: boolean;
}
