import {TipoMovimiento} from './tipoMovimiento';

export interface MovimientoInventario {
  idMovimiento?: number;
  productoNombre: string;
  loteCodigoLote?: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  referencia?: string;
  observaciones?: string;
  fechaMovimiento: string;
}
