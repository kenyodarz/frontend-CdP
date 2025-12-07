import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SupervisionService } from '../../../core/services/supervision.service';
import { DashboardSupervision } from '../../../core/models/supervision/dashboardSupervision';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly supervisionService = inject(SupervisionService);
  private readonly router = inject(Router);

  dashboard: DashboardSupervision | null = null;
  loading = false;
  idSupervisor = 1; // TODO: Obtener del servicio de autenticación

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;
    this.supervisionService.obtenerDashboard(this.idSupervisor).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando dashboard:', error);
        this.loading = false;
      }
    });
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  get totalPendientes(): number {
    if (!this.dashboard) return 0;
    return (this.dashboard.ordenesPendientes || 0) +
      (this.dashboard.despachosPendientes || 0) +
      (this.dashboard.rutasPendientesAsignacion || 0) +
      (this.dashboard.validacionesPendientes || 0);
  }

  get totalAlertas(): number {
    if (!this.dashboard) return 0;
    return (this.dashboard.alertasUrgentes || 0) +
      (this.dashboard.alertasAltas || 0) +
      (this.dashboard.alertasStockBajo || 0);
  }
}
