import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { ReporteService } from '../../../core/services/reporte.service';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-ventas',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    CurrencyPipe,
    BaseChartDirective,
    Loading,
    ErrorMessage
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
})
export class Ventas implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reporteService = inject(ReporteService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ventasData = signal<any[]>([]);

  protected filtrosForm!: FormGroup;
  protected readonly periodos = ['DIA', 'SEMANA', 'MES'];

  // Chart configuration
  protected lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ventas',
        fill: true,
        tension: 0.4,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)'
      }
    ]
  };

  protected lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  protected readonly totalVentas = computed(() => {
    return this.ventasData().reduce((sum, v) => sum + (v.total || 0), 0);
  });

  protected readonly promedioVentas = computed(() => {
    const data = this.ventasData();
    return data.length > 0 ? this.totalVentas() / data.length : 0;
  });

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();
  }

  private initForm(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.filtrosForm = this.fb.group({
      fechaInicio: [hace30Dias],
      fechaFin: [hoy],
      periodo: ['DIA']
    });
  }

  protected cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    const { fechaInicio, fechaFin, periodo } = this.filtrosForm.value;

    this.reporteService.reporteVentas(
      this.formatDate(fechaInicio),
      this.formatDate(fechaFin)
    ).subscribe({
      next: (data: any) => {
        // Simular datos por período para la demo
        const mockData = this.generarDatosPorPeriodo(fechaInicio, fechaFin, periodo);
        this.ventasData.set(mockData);
        this.actualizarGrafica(mockData);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar ventas:', err);
        this.error.set('No se pudieron cargar los datos de ventas.');
        this.loading.set(false);
      }
    });
  }

  private actualizarGrafica(data: any[]): void {
    this.lineChartData = {
      labels: data.map(d => d.fecha),
      datasets: [{
        data: data.map(d => d.total),
        label: 'Ventas',
        fill: true,
        tension: 0.4,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)'
      }]
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  protected exportar(): void {
    // TODO: Implementar exportación a Excel/PDF
    console.log('Exportar datos:', this.ventasData());
  }

  protected onRetry(): void {
    this.cargarDatos();
  }

  private generarDatosPorPeriodo(fechaInicio: Date, fechaFin: Date, periodo: string): any[] {
    // Método temporal para generar datos de ejemplo por período
    const datos: any[] = [];
    const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= dias; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);
      datos.push({
        fecha: fecha.toISOString().split('T')[0],
        total: Math.floor(Math.random() * 1000000) + 500000
      });
    }

    return datos;
  }
}
