import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ReporteService } from '../../core/services/reporte.service';
import { DashboardData } from '../../core/models/reporte/dashboardData';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    CurrencyPipe,
    DecimalPipe
  ],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      @if (loading()) {
        <div class="loading">
          <mat-spinner />
        </div>
      } @else if (data()) {
        <div class="stats-grid">
          <!-- Ventas del Día -->
          <mat-card class="stat-card ventas">
            <mat-card-header>
              <mat-icon>attach_money</mat-icon>
              <mat-card-title>Ventas Hoy</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ data()!.ventasHoy | currency:'COP':'symbol-narrow':'1.0-0' }}</div>
            </mat-card-content>
          </mat-card>

          <!-- Órdenes Pendientes -->
          <mat-card class="stat-card ordenes">
            <mat-card-header>
              <mat-icon>pending_actions</mat-icon>
              <mat-card-title>Pendientes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ data()!.ordenesPendientes }}</div>
              <div class="stat-detail">
                {{ data()!.ordenesEnPreparacion }} en preparación
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Stock Bajo -->
          <mat-card class="stat-card stock">
            <mat-card-header>
              <mat-icon>warning</mat-icon>
              <mat-card-title>Stock Bajo</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ data()!.productosStockBajo }}</div>
              <div class="stat-detail">
                de {{ data()!.totalProductos }} productos
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/productos" color="warn">Ver Productos</a>
            </mat-card-actions>
          </mat-card>

          <!-- Clientes Activos -->
          <mat-card class="stat-card clientes">
            <mat-card-header>
              <mat-icon>people</mat-icon>
              <mat-card-title>Clientes Activos</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ data()!.clientesActivos }}</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Resumen de Órdenes -->
        <mat-card class="ordenes-resumen">
          <mat-card-header>
            <mat-card-title>Estado de Órdenes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="ordenes-grid">
              <div class="orden-stat">
                <span class="label">Pendientes</span>
                <span class="value">{{ data()!.ordenesPendientes }}</span>
              </div>
              <div class="orden-stat">
                <span class="label">En Preparación</span>
                <span class="value">{{ data()!.ordenesEnPreparacion }}</span>
              </div>
              <div class="orden-stat">
                <span class="label">Listas</span>
                <span class="value">{{ data()!.ordenesListas }}</span>
              </div>
              <div class="orden-stat">
                <span class="label">Despachadas</span>
                <span class="value">{{ data()!.ordenesDespachadas }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-raised-button routerLink="/ordenes" color="primary">Ver Todas las Órdenes</a>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 24px;
      color: #333;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      mat-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }

        mat-card-title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
      }

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .stat-detail {
        font-size: 14px;
        color: #666;
      }

      &.ventas {
        mat-icon { color: #4caf50; }
        .stat-value { color: #4caf50; }
      }

      &.ordenes {
        mat-icon { color: #ff9800; }
        .stat-value { color: #ff9800; }
      }

      &.stock {
        mat-icon { color: #f44336; }
        .stat-value { color: #f44336; }
      }

      &.clientes {
        mat-icon { color: #2196f3; }
        .stat-value { color: #2196f3; }
      }
    }

    .ordenes-resumen {
      .ordenes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        padding: 16px 0;
      }

      .orden-stat {
        text-align: center;
        padding: 16px;
        background-color: #f5f5f5;
        border-radius: 8px;

        .label {
          display: block;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .value {
          display: block;
          font-size: 28px;
          font-weight: 600;
          color: #333;
        }
      }
    }
  `]
})
export class Dashboard implements OnInit {
  private readonly reporteService = inject(ReporteService);

  protected readonly loading = signal(true);
  protected readonly data = signal<DashboardData | null>(null);

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.reporteService.obtenerDashboard().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.loading.set(false);
      }
    });
  }
}