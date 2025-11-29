import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    CurrencyPipe,
    BaseChartDirective,
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

  protected readonly limites = [5, 10, 15, 20];

  // Chart configuration
  protected barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cantidad Vendida',
        backgroundColor: 'rgba(25, 118, 210, 0.7)',
        borderColor: '#1976d2',
        borderWidth: 1
      }
    ]
  };

  protected barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': ' + context.parsed.y + ' unidades';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

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
    this.cargarDatos();
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
    this.barChartData = {
      labels: data.map(p => p.nombre),
      datasets: [{
        data: data.map(p => p.cantidadVendida),
        label: 'Cantidad Vendida',
        backgroundColor: 'rgba(25, 118, 210, 0.7)',
        borderColor: '#1976d2',
        borderWidth: 1
      }]
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
