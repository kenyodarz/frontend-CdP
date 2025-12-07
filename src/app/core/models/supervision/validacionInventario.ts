export interface ValidacionInventario {
  idValidacion?: number;
  idDocumentoEntrada: number;
  idSupervisor: number;
  estadoValidacion: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CON_DISCREPANCIAS';
  discrepancias?: { [key: string]: any };
  comentarios?: string;
  fechaValidacion: Date;
}
