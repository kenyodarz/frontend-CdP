import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { FloatLabelModule } from 'primeng/floatlabel';

import { ReporteService } from '../../../core/services/reporte.service';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

// Usando la interfaz del servicio
import { ProductoVendido as ProductoVendidoModel } from '../../../core/models/reporte/productoVendido';

interface ProductoVendido {
  idProducto: number;
  codigo: string;
  nombre: string;
  cantidadVendida: number;
  totalVentas: number;
}

@Component({
  selector: 'app-productos-mas-vendidos',
  imports: [
    CardModule,
    ButtonModule,
    SelectModule,
    ChartModule,
    FloatLabelModule,
    FormsModule,
    CurrencyPipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './productos-mas-vendidos.html',
  styleUrl: './productos-mas-vendidos.scss',
})
export class ProductosMasVendidos implements OnInit {
  private readonly reporteService = inject(ReporteService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<ProductoVendido[]>([]);
  protected readonly limite = signal(10);

  protected readonly limites = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 15', value: 15 },
    { label: 'Top 20', value: 20 }
  ];

  // Chart configuration
  protected barChartData: any;
  protected barChartOptions: any;

  protected readonly topProductos = computed(() => {
    return this.productos().slice(0, this.limite());
  });

  protected readonly totalVendido = computed(() => {
    return this.topProductos().reduce((sum, p) => sum + p.cantidadVendida, 0);
  });

  protected readonly totalIngresos = computed(() => {
    return this.topProductos().reduce((sum, p) => sum + p.totalVentas, 0);
  });

  ngOnInit(): void {
    this.initChartOptions();
    this.cargarDatos();
  }

  private initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return context.dataset.label + ': ' + context.parsed.y + ' unidades';
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
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

  protected cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    // Usar fechas de ejemplo (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.reporteService.productosMasVendidos(
      hace30Dias.toISOString().split('T')[0],
      hoy.toISOString().split('T')[0],
      this.limite()
    ).subscribe({
      next: (data: ProductoVendidoModel[]) => {
        // Mapear del modelo del servicio al modelo local
        const productosVendidos: ProductoVendido[] = data.map(p => ({
          idProducto: p.idProducto,
          codigo: `PROD-${p.idProducto}`,
          nombre: p.nombreProducto,
          cantidadVendida: p.cantidadVendida,
          totalVentas: p.valorTotal
        }));
        this.productos.set(productosVendidos);
        this.actualizarGrafica(productosVendidos.slice(0, this.limite()));
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar productos más vendidos:', err);
        this.error.set('No se pudieron cargar los productos más vendidos.');
        this.loading.set(false);
      }
    });
  }

  private actualizarGrafica(data: ProductoVendido[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = documentStyle.getPropertyValue('--primary-color');

    this.barChartData = {
      labels: data.map(p => p.nombre),
      datasets: [
        {
          label: 'Cantidad Vendida',
          data: data.map(p => p.cantidadVendida),
          backgroundColor: primaryColor ? primaryColor + 'B3' : 'rgba(59, 130, 246, 0.7)', // Add opacity
          borderColor: primaryColor || '#3B82F6',
          borderWidth: 1
        }
      ]
    };
  }

  protected onLimiteChange(): void {
    this.actualizarGrafica(this.productos().slice(0, this.limite()));
  }

  protected exportar(): void {
    // TODO: Implementar exportación
    console.log('Exportar productos:', this.topProductos());
  }

  protected onRetry(): void {
    this.cargarDatos();
  }
}
