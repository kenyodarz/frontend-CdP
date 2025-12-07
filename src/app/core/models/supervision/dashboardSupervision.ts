export interface DashboardSupervision {
  // Métricas de órdenes
  ordenesPendientes: number;
  ordenesAprobadasHoy: number;
  ordenesRechazadasHoy: number;

  // Métricas de despachos
  despachosPendientes: number;
  despachosAprobadosHoy: number;

  // Métricas de rutas
  rutasPendientesAsignacion: number;
  rutasEnCurso: number;
  rutasCompletadasHoy: number;

  // Métricas de inventario
  validacionesPendientes: number;
  alertasStockBajo: number;
  productosProximosVencer: number;

  // Alertas
  alertasUrgentes: number;
  alertasAltas: number;
}
