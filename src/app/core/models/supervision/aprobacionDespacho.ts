export interface AprobacionDespacho {
  idAprobacion?: number;
  idDocumentoSalida: number;
  idSupervisor: number;
  estadoAnterior: string;
  estadoNuevo: string;
  accion: 'APROBAR' | 'RECHAZAR' | 'REASIGNAR';
  comentarios?: string;
  fechaAprobacion: Date;
}
