export interface CrearDocumentoSalidaDTO {
  idRuta: number;
  idConductor: number;
  idsOrdenes: number[];
  fechaSalida: Date | string;
  observaciones?: string;
  idEmpleado: number;
}
