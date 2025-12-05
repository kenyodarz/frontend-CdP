import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { FloatLabelModule } from 'primeng/floatlabel';

import { ReporteService } from '../../../core/services/reporte.service';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ReporteVentas } from '../../../core/models/reporte/reporteVentas';

@Component({
  selector: 'app-ventas',
  imports: [
    CardModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    ChartModule,
    FloatLabelModule,
    ReactiveFormsModule,
    CurrencyPipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
})
export class Ventas implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ventasData = signal<any[]>([]);
  protected readonly reportSummary = signal<{ total: number, promedio: number }>({ total: 0, promedio: 0 });

  protected filtrosForm: FormGroup;

  protected readonly periodos = [
    { label: 'Diario', value: 'diario' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' }
  ];

  // Chart configuration
  protected lineChartData: any;
  protected lineChartOptions: any;

  protected readonly totalVentas = computed(() => this.reportSummary().total);
  protected readonly promedioVentas = computed(() => this.reportSummary().promedio);

  constructor() {
    this.filtrosForm = this.fb.group({
      fechaInicio: [new Date()],
      fechaFin: [new Date()],
      periodo: ['diario']
    });
  }

  ngOnInit(): void {
    this.initChartOptions();
    this.cargarDatos();
  }

  private initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.lineChartOptions = {
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

  protected cargarDatos(): void {
    if (this.filtrosForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { fechaInicio, fechaFin } = this.filtrosForm.value;

    this.reporteService.reporteVentas(
      fechaInicio.toISOString().split('T')[0],
      fechaFin.toISOString().split('T')[0]
    ).subscribe({
      next: (data: ReporteVentas) => {
        this.ventasData.set(data.ventasPorDia);
        this.reportSummary.set({
          total: data.totalVentas,
          promedio: data.promedioVenta
        });
        this.actualizarGrafica(data.ventasPorDia);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar reporte de ventas:', err);
        this.error.set('No se pudo cargar el reporte de ventas.');
        this.loading.set(false);
      }
    });
  }

  private actualizarGrafica(data: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = documentStyle.getPropertyValue('--primary-color');

    this.lineChartData = {
      labels: data.map(d => d.fecha),
      datasets: [
        {
          label: 'Ventas',
          data: data.map(d => d.totalVenta),
          fill: false,
          borderColor: primaryColor || '#3B82F6',
          tension: 0.4
        }
      ]
    };
  }

  protected exportar(): void {
    // TODO: Implementar exportación a Excel/PDF
    console.log('Exportar reporte:', this.ventasData());
  }

  protected onRetry(): void {
    this.cargarDatos();
  }
}
