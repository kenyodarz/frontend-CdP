export interface CierreInventario {
  idCierre?: number;
  idProducto: number;
  periodo: string; // Format: "YYYY-MM" for monthly, "YYYY" for annual
  tipoCierre: 'MENSUAL' | 'ANUAL';
  stockInicial: number;
  totalEntradas: number;
  totalSalidas: number;
  stockFinal: number;
  fechaCierre: Date;
  idUsuario: number;
  observaciones?: string;
  estado: 'ACTIVO' | 'ARCHIVADO';
}
