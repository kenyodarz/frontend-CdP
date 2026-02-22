import {Component, inject, OnInit, signal} from '@angular/core';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {RouterLink} from '@angular/router';
import {ReporteService} from '../../core/services/reporte.service';
import {DashboardData} from '../../core/models/reporte/dashboardData';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    RouterLink,
    CurrencyPipe
  ],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      @if (loading()) {
        <div class="loading">
          <p-progressSpinner />
        </div>
      } @else if (data()) {
        <div class="stats-grid">
          <!-- Ventas del Día -->
          <p-card styleClass="stat-card ventas">
            <ng-template pTemplate="header">
              <div class="card-header">
                <i class="pi pi-dollar"></i>
                <span class="card-title">Ventas Hoy</span>
              </div>
            </ng-template>
            <div class="stat-value">{{ data()!.ventasHoy | currency:'COP':'symbol-narrow':'1.0-0' }}</div>
          </p-card>

          <!-- Órdenes Pendientes -->
          <p-card styleClass="stat-card ordenes">
            <ng-template pTemplate="header">
              <div class="card-header">
                <i class="pi pi-clock"></i>
                <span class="card-title">Pendientes</span>
              </div>
            </ng-template>
            <div class="stat-value">{{ data()!.ordenesPendientes }}</div>
            <div class="stat-detail">
              {{ data()!.ordenesEnPreparacion }} en preparación
            </div>
          </p-card>

          <!-- Órdenes por Pagar -->
          <p-card styleClass="stat-card por-pagar">
            <ng-template pTemplate="header">
              <div class="card-header">
                <i class="pi pi-money-bill"></i>
                <span class="card-title">Por Pagar</span>
              </div>
            </ng-template>
            <div class="stat-value">{{ data()!.ordenesPendientesPorPagar }}</div>
            <div class="stat-detail">
              órdenes entregadas
            </div>
            <ng-template pTemplate="footer">
              <p-button label="Ir a Pagos" [link]="true" routerLink="/pagos" severity="warn" />
            </ng-template>
          </p-card>

          <!-- Clientes Activos -->
          <p-card styleClass="stat-card clientes">
            <ng-template pTemplate="header">
              <div class="card-header">
                <i class="pi pi-users"></i>
                <span class="card-title">Clientes Activos</span>
              </div>
            </ng-template>
            <div class="stat-value">{{ data()!.clientesActivos }}</div>
          </p-card>
        </div>

        <!-- Resumen de Órdenes -->
        <p-card styleClass="ordenes-resumen">
          <ng-template pTemplate="header">
            <span class="card-title">Estado de Órdenes</span>
          </ng-template>
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
          <ng-template pTemplate="footer">
            <p-button label="Ver Todas las Órdenes" routerLink="/ordenes" />
          </ng-template>
        </p-card>
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

    :host ::ng-deep {
      .stat-card {
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;

          i {
            font-size: 32px;
          }

          .card-title {
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
          i { color: #4caf50; }
          .stat-value { color: #4caf50; }
        }

        &.ordenes {
          i { color: #ff9800; }
          .stat-value { color: #ff9800; }
        }

        &.por-pagar {
          i { color: #f59e0b; }
          .stat-value { color: #f59e0b; }
        }

        &.clientes {
          i { color: #2196f3; }
          .stat-value { color: #2196f3; }
        }
      }

      .ordenes-resumen {
        .card-title {
          padding: 1rem;
          font-size: 18px;
          font-weight: 500;
        }

        .ordenes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          padding: 16px 0;
        }

        .orden-stat {
          text-align: center;
          padding: 16px;
          background-color: var(--surface-100);
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
