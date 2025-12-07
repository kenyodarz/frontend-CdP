export interface AprobacionOrden {
  idAprobacion?: number;
  idOrden: number;
  idSupervisor: number;
  estadoAnterior: string;
  estadoNuevo: string;
  accion: 'APROBAR' | 'RECHAZAR' | 'MODIFICAR';
  comentarios?: string;
  fechaAprobacion: Date;
}
