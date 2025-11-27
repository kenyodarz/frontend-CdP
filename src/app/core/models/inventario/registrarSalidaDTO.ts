export interface RegistrarSalidaDTO {
  idProducto: number;
  cantidad: number;
  motivo: string;
  codigoLote?: string;
  referencia?: string;
  observaciones?: string;
}
