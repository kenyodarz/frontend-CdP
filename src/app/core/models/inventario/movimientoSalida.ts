export interface MovimientoSalida {
  idMovimientoSalida?: number;
  idDocumentoSalida: number;
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
