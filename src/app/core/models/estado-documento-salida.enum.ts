export enum EstadoDocumentoSalida {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  DESPACHADA = 'DESPACHADA',
  CANCELADO = 'CANCELADO'
}

export const ESTADO_LABELS: Record<EstadoDocumentoSalida, string> = {
  [EstadoDocumentoSalida.PENDIENTE]: 'Pendiente',
  [EstadoDocumentoSalida.EN_PREPARACION]: 'En Preparación',
  [EstadoDocumentoSalida.LISTO]: 'Listo',
  [EstadoDocumentoSalida.DESPACHADA]: 'Despachada',
  [EstadoDocumentoSalida.CANCELADO]: 'Cancelado'
};

export const ESTADO_SEVERITIES: Record<EstadoDocumentoSalida, 'warn' | 'info' | 'success' | 'secondary' | 'danger'> = {
  [EstadoDocumentoSalida.PENDIENTE]: 'warn',
  [EstadoDocumentoSalida.EN_PREPARACION]: 'info',
  [EstadoDocumentoSalida.LISTO]: 'success',
  [EstadoDocumentoSalida.DESPACHADA]: 'secondary',
  [EstadoDocumentoSalida.CANCELADO]: 'danger'
};
