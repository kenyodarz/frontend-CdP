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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { ReporteService } from '../../../core/services/reporte.service';
import { OrdenService } from '../../../core/services/orden.service';
import { ProductoService } from '../../../core/services/producto.service';
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
    ProgressSpinnerModule,
    DialogModule,
    Loading,
    ErrorMessage
  ],
  templateUrl: './dashboard-proforma.html',
  styleUrl: './dashboard-proforma.scss',
})
export class DashboardProforma implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly ordenService = inject(OrdenService);
  private readonly productoService = inject(ProductoService);
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
  protected readonly todosLosClientes = signal<ClienteBusqueda[]>([]);
  protected readonly loadingClientes = signal<boolean>(false);
  protected readonly detallesClienteSeleccionado = signal<DetalleVenta[]>([]);
  protected readonly productosOrdenExpandida = signal<ProductoOrden[]>([]);
  protected readonly loadingOrdenProductos = signal<boolean>(false);
  protected dialogVisible = signal<boolean>(false);
  protected ordenSeleccionada = signal<DetalleVenta | null>(null);
  protected buscarClientesForm: FormGroup;
  protected readonly mesesOptions = [
    { label: 'Todos', value: null },
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];
  protected readonly aniosOptions = signal<number[]>([]);

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

    // Initialize forms (sin cambios)
    this.comparacionForm = this.fb.group({
      productoId: [null],
      anio: [currentYear]
    });

    this.productosMesForm = this.fb.group({
      mes: [null]
    });

    this.buscarClientesForm = this.fb.group({
      clienteId: [null],
      mes: [null],
      anio: [currentYear]
    });

    this.buscarProductosForm = this.fb.group({
      query: [''],
      mes: [null],
      anio: [currentYear]
    });

    this.detallesVentasForm = this.fb.group({
      fechaDesde: [null],
      fechaHasta: [null],
      tipoCliente: [null]
    });

    this.overviewForm = this.fb.group({
      anio: [currentYear]
    });
  }

  ngOnInit(): void {
    this.initChartOptions();
    this.initAvailableYears();
    this.initAniosOptions();
    this.cargarDashboard();
    this.cargarProductos();
    this.cargarMesesDisponibles();
    this.cargarTodosLosClientes();
    this.setupOverviewYearChange();
  }

  // Métodos privados (sin cambios, excepto initChartOptions si necesitas)
  private initAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    this.availableYears.set(years);
  }

  private initAniosOptions(): void {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    this.aniosOptions.set(years);
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

  // Tab 1: Overview (cargarDashboard sin cambios)
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

  // Tab 2: Comparación (sin cambios mayores)
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

  // Tab 3: Productos por Mes (sin cambios)
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

  // Tab 4: Clientes (cargarTodosLosClientes sin cambios)
  private cargarTodosLosClientes(): void {
    this.loadingClientes.set(true);
    this.reporteService.buscarClientes('').subscribe({
      next: (clientes) => {
        this.todosLosClientes.set(clientes);
        this.loadingClientes.set(false);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.loadingClientes.set(false);
      }
    });
  }

  protected buscarComprasCliente(): void {
    const { clienteId, mes, anio } = this.buscarClientesForm.value;

    if (!clienteId) {
      return;
    }

    let fechaDesde: string | undefined;
    let fechaHasta: string | undefined;

    if (mes && anio) {
      const mesStr = mes.toString().padStart(2, '0');
      fechaDesde = `${anio}-${mesStr}-01`;
      const lastDay = new Date(anio, mes, 0).getDate();
      fechaHasta = `${anio}-${mesStr}-${lastDay.toString().padStart(2, '0')}`;
    } else if (anio) {
      fechaDesde = `${anio}-01-01`;
      fechaHasta = `${anio}-12-31`;
    }

    this.loading.set(true);
    this.reporteService.getDetallesVentas(fechaDesde, fechaHasta, undefined, clienteId).subscribe({
      next: (detalles) => {
        this.detallesClienteSeleccionado.set(detalles);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar detalles del cliente:', err);
        this.loading.set(false);
      }
    });
  }

  // Tab 6: Detalles Ventas (sin cambios)
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

  // Tab 5: Búsqueda de Productos
  protected buscarProductosAction(query: string): void {
    const { mes, anio } = this.buscarProductosForm.value;

    // Si no hay query, limpiar resultados
    if (!query || query.length < 2) {
      this.productosResultados.set([]);
      return;
    }

    // Construir rango de fechas basado en filtros
    let fechaDesde: string | undefined;
    let fechaHasta: string | undefined;

    if (mes && anio) {
      // Mes específico
      const lastDay = new Date(anio, mes, 0).getDate();
      fechaDesde = `${anio}-${String(mes).padStart(2, '0')}-01`;
      fechaHasta = `${anio}-${String(mes).padStart(2, '0')}-${lastDay}`;
    } else if (anio) {
      // Todo el año
      fechaDesde = `${anio}-01-01`;
      fechaHasta = `${anio}-12-31`;
    }

    this.loading.set(true);
    this.reporteService.buscarProductos(query, fechaDesde, fechaHasta).subscribe({
      next: (productos) => {
        this.productosResultados.set(productos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al buscar productos:', err);
        this.productosResultados.set([]);
        this.loading.set(false);
      }
    });
  }

  protected verDetalleOrden(detalle: DetalleVenta): void {
    this.ordenSeleccionada.set(detalle);
    this.productosOrdenExpandida.set([]);
    this.loadingOrdenProductos.set(true);
    this.dialogVisible.set(true);

    this.ordenService.obtenerPorId(detalle.idOrden).subscribe({
      next: (ordenCompleta) => {
        // Obtener IDs únicos de productos
        const productosIds = [...new Set(ordenCompleta.detalles.map(d => d.idProducto))];

        // Crear observables para cada producto
        const productosRequests = productosIds.map(id =>
          this.productoService.obtenerPorId(id)
        );

        // Ejecutar todas las peticiones en paralelo
        forkJoin(productosRequests).subscribe({
          next: (productosData) => {
            // Crear mapa de ID -> Nombre
            const productosMap = new Map(
              productosData.map(p => [p.idProducto, p.nombre])
            );

            // Mapear detalles con nombres reales
            const productos: ProductoOrden[] = ordenCompleta.detalles.map(d => ({
              nombreProducto: productosMap.get(d.idProducto) || `Producto #${d.idProducto}`,
              cantidad: d.cantidad,
              precioUnitario: d.precioUnitario,
              subtotal: d.subtotal
            }));

            this.productosOrdenExpandida.set(productos);
            this.loadingOrdenProductos.set(false);
          },
          error: (err) => {
            console.error('Error al cargar nombres de productos:', err);
            // Fallback: usar IDs si falla la carga de nombres
            const productos: ProductoOrden[] = ordenCompleta.detalles.map(d => ({
              nombreProducto: `Producto #${d.idProducto}`,
              cantidad: d.cantidad,
              precioUnitario: d.precioUnitario,
              subtotal: d.subtotal
            }));
            this.productosOrdenExpandida.set(productos);
            this.loadingOrdenProductos.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar productos de la orden:', err);
        this.productosOrdenExpandida.set([]);
        this.loadingOrdenProductos.set(false);
      }
    });
  }
}
