export interface MovimientoEntrada {
  idMovimientoEntrada?: number;
  idDocumentoEntrada: number;
  idProducto: number;
  codigoLote: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  fechaMovimiento: Date;
  observaciones?: string;
  idUsuario?: number;
  createdAt?: Date;
}
