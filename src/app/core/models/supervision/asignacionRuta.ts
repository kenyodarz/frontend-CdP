export interface AsignacionRuta {
  idAsignacion?: number;
  idRuta: number;
  idConductor?: number;
  idVehiculo?: number;
  idSupervisor: number;
  fechaAsignacion: Date;
  estado: 'PENDIENTE' | 'ASIGNADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';
  observaciones?: string;
}
