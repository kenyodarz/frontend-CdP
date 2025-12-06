import { EstadoDocumentoSalida } from './estado-documento-salida.enum';
import { DetalleDocumentoSalida } from './detalle-documento-salida.model';

export interface DocumentoSalida {
  id?: number;
  numeroDocumento?: string;
  idRuta: number;
  nombreRuta?: string;
  idConductor: number;
  nombreConductor?: string;
  fechaSalida: Date | string;
  fechaDespacho?: Date | string;
  estado: EstadoDocumentoSalida;
  valorTotal?: number;
  observaciones?: string;

  // Auditoría
  idEmpleadoCreacion?: number;
  nombreEmpleadoCreacion?: string;
  idEmpleadoUltimaModificacion?: number;
  nombreEmpleadoUltimaModificacion?: string;
  fechaCambioEstado?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Relaciones
  detalles?: DetalleDocumentoSalida[];
  idsOrdenes?: number[];
}
