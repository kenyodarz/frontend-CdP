/**
 * Dashboard Proforma 2025 response interface.
 * Contains aggregated sales data, top products, and client type analysis.
 */
export interface DashboardProformaResponse {
  resumen: ResumenDTO;
  ventasMensuales: VentaMensualDTO[];
  ventasPorTipoCliente: VentaPorTipoClienteDTO[];
  topProductos: ProductoMasVendidoDTO[];
}

/**
 * Summary statistics for the dashboard.
 */
export interface ResumenDTO {
  /** Total revenue/income */
  ingresos: number;

  /** Number of sales transactions */
  ventas: number;

  /** Average ticket/sale amount */
  ticketPromedio: number;

  /** Number of unique products sold */
  productosUnicos: number;
}

/**
 * Monthly sales data.
 */
export interface VentaMensualDTO {
  /** Month in YYYY-MM format */
  mes: string;

  /** Number of sales in the month */
  ventas: number;

  /** Total revenue for the month */
  ingresos: number;
}

/**
 * Sales data by client type.
 */
export interface VentaPorTipoClienteDTO {
  /** Client type (0D, 5D, 10D, ES, JM, CR) */
  tipo: string;

  /** Number of sales to this client type */
  ventas: number;

  /** Total revenue from this client type */
  ingresos: number;
}

/**
 * Top selling product data.
 */
export interface ProductoMasVendidoDTO {
  /** Product name */
  producto: string;

  /** Number of units sold */
  unidades: number;

  /** Total revenue from this product */
  ingresos: number;
}
