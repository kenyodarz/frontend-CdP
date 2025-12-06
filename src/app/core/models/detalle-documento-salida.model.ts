export interface DetalleDocumentoSalida {
  id?: number;
  idDocumentoSalida?: number;
  idProducto: number;
  nombreProducto?: string;
  codigoProducto?: string;
  cantidadTotal: number;
  precioUnitario: number;
  subtotal: number;
  unidadMedida?: string;
}
