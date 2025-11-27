export interface CrearLoteDTO {
  idProducto: number;
  codigoLote: string;
  fechaElaboracion: string;
  fechaVencimiento?: string;
  cantidad: number;
}
