import {VentaDiaria} from './ventaDiaria';

export interface ReporteVentas {
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  cantidadOrdenes: number;
  promedioVenta: number;
  ventasPorDia: VentaDiaria[];
}
