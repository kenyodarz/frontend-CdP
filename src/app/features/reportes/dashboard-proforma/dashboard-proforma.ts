import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ReporteService } from '../../../core/services/reporte.service';
import { OrdenService } from '../../../core/services/orden.service';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { DashboardProformaResponse } from '../../../core/models/reporte/dashboard-proforma';
import { ProductoSimple } from '../../../core/models/reporte/producto-simple';
import { ComparacionProducto } from '../../../core/models/reporte/comparacion-producto';
import { ProductoVendidoMes } from '../../../core/models/reporte/producto-vendido-mes';
import { ClienteBusqueda } from '../../../core/models/reporte/cliente-busqueda';
import { ProductoBusqueda } from '../../../core/models/reporte/producto-busqueda';
import { DetalleVenta } from '../../../core/models/reporte/detalle-venta';
import { ProductoOrden } from '../../../core/models/reporte/producto-orden';

@Component({
  selector: 'app-dashboard-proforma',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TabsModule,
    TableModule,
    ChartModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    FloatLabelModule,
    ReactiveFormsModule,
    Loading,
    ErrorMessage,
    ProgressSpinner
  ],
  templateUrl: './dashboard-proforma.html',
  styleUrl: './dashboard-proforma.scss',
})
export class DashboardProforma implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly ordenService = inject(OrdenService);
  private readonly fb = inject(FormBuilder);

  // Loading and error states
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Tab 1: Overview data
  protected readonly dashboardData = signal<DashboardProformaResponse | null>(null);
  protected ventasMensualesChart: any;
  protected ventasTipoClienteChart: any;

  // Tab 2: Comparación Producto
  protected readonly productos = signal<ProductoSimple[]>([]);
  protected readonly comparacionData = signal<ComparacionProducto | null>(null);
  protected comparacionForm: FormGroup;
  protected comparacionChart: any;

  // Tab 3: Productos por Mes
  protected readonly mesesDisponibles = signal<string[]>([]);
  protected readonly productosMes = signal<ProductoVendidoMes[]>([]);
  protected productosMesForm: FormGroup;
  protected productosMesChart: any;

  // Tab 4: Búsqueda Clientes
  protected readonly clientesResultados = signal<ClienteBusqueda[]>([]);
  protected readonly clienteSeleccionado = signal<ClienteBusqueda | null>(null);
  protected readonly detallesClienteSeleccionado = signal<DetalleVenta[]>([]);
  protected readonly productosOrdenExpandida = signal<ProductoOrden[]>([]);
  protected readonly loadingOrdenProductos = signal<boolean>(false);
  protected buscarClientesForm: FormGroup;

  // Tab 5: Búsqueda Productos
  protected readonly productosResultados = signal<ProductoBusqueda[]>([]);
  protected buscarProductosForm: FormGroup;

  // Tab 6: Detalles Ventas
  protected readonly detallesVentas = signal<DetalleVenta[]>([]);
  protected detallesVentasForm: FormGroup;

  // Overview year filter
  protected overviewForm: FormGroup;
  protected readonly availableYears = signal<number[]>([]);

  // Chart options
  protected chartOptions: any;

  constructor() {
    const currentYear = new Date().getFullYear();

    // Initialize forms
    this.comparacionForm = this.fb.group({
      productoId: [null],
      anio: [currentYear]
    });

    this.productosMesForm = this.fb.group({
      mes: [null]
    });

    this.buscarClientesForm = this.fb.group({
      query: ['']
    });

    this.buscarProductosForm = this.fb.group({
      query: ['']
    });

    this.detallesVentasForm = this.fb.group({
      fechaDesde: [null],
      fechaHasta: [null],
      tipoCliente: [null]
    });

    // Overview year filter form
    this.overviewForm = this.fb.group({
      anio: [currentYear]
    });
  }

  ngOnInit(): void {
    this.initChartOptions();
    this.initAvailableYears();
    this.cargarDashboard();
    this.cargarProductos();
    this.cargarMesesDisponibles();
    this.setupSearchDebounce();
    this.setupOverviewYearChange();
  }

  private initAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Last 5 years including current
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    this.availableYears.set(years);
  }

  private setupOverviewYearChange(): void {
    this.overviewForm.get('anio')?.valueChanges.subscribe(() => {
      this.cargarDashboard();
    });
  }

  private initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  // Tab 1: Overview
  protected cargarDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    const anio = this.overviewForm.get('anio')?.value || new Date().getFullYear();
    const fechaInicio = `${anio}-01-01`;
    const fechaFin = `${anio}-12-31`;

    this.reporteService.obtenerDashboardProforma(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.actualizarGraficasOverview(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        this.error.set('No se pudo cargar el dashboard.');
        this.loading.set(false);
      }
    });
  }

  private actualizarGraficasOverview(data: DashboardProformaResponse): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#3B82F6';

    // Ventas Mensuales Chart
    this.ventasMensualesChart = {
      labels: data.ventasMensuales.map(v => v.mes),
      datasets: [
        {
          label: 'Ingresos',
          data: data.ventasMensuales.map(v => v.ingresos),
          borderColor: primaryColor,
          tension: 0.4
        }
      ]
    };

    // Ventas por Tipo Cliente Chart (Pie)
    this.ventasTipoClienteChart = {
      labels: data.ventasPorTipoCliente.map(v => v.tipo),
      datasets: [
        {
          data: data.ventasPorTipoCliente.map(v => v.ingresos),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
        }
      ]
    };
  }

  // Tab 2: Comparación Producto
  protected cargarProductos(): void {
    this.reporteService.getProductos().subscribe({
      next: (productos) => {
        this.productos.set(productos);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  protected cargarComparacion(): void {
    if (this.comparacionForm.invalid) return;

    const { productoId, anio } = this.comparacionForm.value;
    if (!productoId || !anio) return;

    this.loading.set(true);
    this.reporteService.getComparacionProducto(productoId, anio).subscribe({
      next: (data) => {
        this.comparacionData.set(data);
        this.actualizarGraficaComparacion(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar comparación:', err);
        this.error.set('No se pudo cargar la comparación.');
        this.loading.set(false);
      }
    });
  }

  private actualizarGraficaComparacion(data: ComparacionProducto): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#3B82F6';

    this.comparacionChart = {
      labels: data.meses.map(m => m.mes),
      datasets: [
        {
          label: 'Cantidad',
          data: data.meses.map(m => m.cantidad),
          borderColor: primaryColor,
          tension: 0.4
        }
      ]
    };
  }

  // Tab 3: Productos por Mes
  protected cargarMesesDisponibles(): void {
    this.reporteService.getMesesDisponibles().subscribe({
      next: (meses) => {
        this.mesesDisponibles.set(meses);
      },
      error: (err) => {
        console.error('Error al cargar meses:', err);
      }
    });
  }

  protected cargarProductosPorMes(): void {
    if (this.productosMesForm.invalid) return;

    const { mes } = this.productosMesForm.value;
    if (!mes) return;

    this.loading.set(true);
    this.reporteService.getProductosPorMes(mes).subscribe({
      next: (productos) => {
        this.productosMes.set(productos);
        this.actualizarGraficaProductosMes(productos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos por mes:', err);
        this.error.set('No se pudieron cargar los productos.');
        this.loading.set(false);
      }
    });
  }

  private actualizarGraficaProductosMes(productos: ProductoVendidoMes[]): void {
    const top10 = productos.slice(0, 10);

    this.productosMesChart = {
      labels: top10.map(p => p.producto),
      datasets: [
        {
          label: 'Unidades Vendidas',
          data: top10.map(p => p.unidades),
          backgroundColor: '#42A5F5'
        }
      ]
    };
  }

  // Tab 4 & 5: Búsquedas con debounce
  private setupSearchDebounce(): void {
    // Búsqueda de clientes
    this.buscarClientesForm.get('query')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query && query.length >= 2) {
          this.buscarClientesAction(query);
        } else {
          this.clientesResultados.set([]);
        }
      });

    // Búsqueda de productos
    this.buscarProductosForm.get('query')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query && query.length >= 2) {
          this.buscarProductosAction(query);
        } else {
          this.productosResultados.set([]);
        }
      });
  }

  private buscarClientesAction(query: string): void {
    this.reporteService.buscarClientes(query).subscribe({
      next: (clientes) => {
        this.clientesResultados.set(clientes);
      },
      error: (err) => {
        console.error('Error al buscar clientes:', err);
      }
    });
  }

  private buscarProductosAction(query: string): void {
    this.reporteService.buscarProductos(query).subscribe({
      next: (productos) => {
        this.productosResultados.set(productos);
      },
      error: (err) => {
        console.error('Error al buscar productos:', err);
      }
    });
  }

  // Ver detalle de cliente seleccionado
  protected verDetalleCliente(event: any): void {
    const cliente = event.data as ClienteBusqueda;
    this.clienteSeleccionado.set(cliente);

    // Cargar detalles de ventas del cliente
    this.reporteService.getDetallesVentas(undefined, undefined, cliente.tipo).subscribe({
      next: (detalles) => {
        // Filtrar solo las ventas de este cliente
        const detallesCliente = detalles.filter(d => d.cliente === cliente.nombre);
        this.detallesClienteSeleccionado.set(detallesCliente);
      },
      error: (err) => {
        console.error('Error al cargar detalles del cliente:', err);
      }
    });
  }

  // Tab 6: Detalles Ventas
  protected cargarDetallesVentas(): void {
    const { fechaDesde, fechaHasta, tipoCliente } = this.detallesVentasForm.value;

    const fechaDesdeStr = fechaDesde ? fechaDesde.toISOString().split('T')[0] : undefined;
    const fechaHastaStr = fechaHasta ? fechaHasta.toISOString().split('T')[0] : undefined;

    this.loading.set(true);
    this.reporteService.getDetallesVentas(fechaDesdeStr, fechaHastaStr, tipoCliente).subscribe({
      next: (detalles) => {
        this.detallesVentas.set(detalles);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar detalles de ventas:', err);
        this.error.set('No se pudieron cargar los detalles de ventas.');
        this.loading.set(false);
      }
    });
  }

  protected onRetry(): void {
    this.cargarDashboard();
  }

  // Manejar expansión de fila para mostrar productos de la orden
  protected onRowExpand(event: any): void {
    const detalle = event.data as DetalleVenta;
    this.loadingOrdenProductos.set(true);

    // Cargar productos de la orden
    this.ordenService.obtenerPorId(detalle.idOrden).subscribe({
      next: (ordenCompleta) => {
        // Mapear detalles de orden a ProductoOrden
        const productos: ProductoOrden[] = ordenCompleta.detalles.map(detalle => ({
          nombreProducto: `Producto #${detalle.idProducto}`,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.subtotal
        }));
        this.productosOrdenExpandida.set(productos);
        this.loadingOrdenProductos.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos de la orden:', err);
        this.loadingOrdenProductos.set(false);
      }
    });
  }
}
