import {VentaDiaria} from './ventaDiaria';

export interface ReporteVentas {
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  numeroOrdenes: number;
  promedioVenta: number;
  ventasPorDia: VentaDiaria[];
}
