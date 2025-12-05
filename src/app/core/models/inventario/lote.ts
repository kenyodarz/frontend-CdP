export interface Lote {
  codigoLote: string;
  fechaElaboracion: string;
  fechaVencimiento?: string;
  estado: 'ACTIVO' | 'VENCIDO' | 'ANULADO';
  observaciones?: string;
}
