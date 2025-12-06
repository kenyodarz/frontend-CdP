export enum EstadoDocumento {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  ANULADO = 'ANULADO',
  REVISADO = 'REVISADO',
  CERRADO = 'CERRADO',
  CORREGIDO = 'CORREGIDO',
  CON_AJUSTES = 'CON_AJUSTES',
}

export interface DetalleRecepcion {
  id?: number;
  idProducto: number;
  nombreProducto?: string;
  codigoProducto?: string;
  cantidad: number;
  codigoLote?: string;
  observaciones?: string;
}

export interface DocumentoRecepcion {
  id?: number;
  numeroDocumento?: string;
  fechaRecepcion?: string;
  fechaElaboracion: string;
  motivo: string;
  observaciones?: string;
  estado?: EstadoDocumento;
  idUsuario?: number;
  fechaCreacion?: string;
  fechaConfirmacion?: string;
  fechaAnulacion?: string;
  motivoAnulacion?: string;
  detalles: DetalleRecepcion[];
  totalProductos?: number;
  cantidadTotal?: number;
}

export interface CrearDocumentoRecepcionDTO {
  fechaElaboracion: string;
  motivo: string;
  observaciones?: string;
  detalles: DetalleRecepcionDTO[];
}

export interface DetalleRecepcionDTO {
  idProducto: number;
  cantidad: number;
  codigoLote?: string;
  observaciones?: string;
}

export interface AnularDocumentoDTO {
  motivo: string;
}
