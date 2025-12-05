import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { OrdenService } from '../../../core/services/orden.service';
import { OrdenDespachoSimple } from '../../../core/models/orden/ordenDespachoSimple';
import { PageResponse } from '../../../core/models/common/page-response';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-lista-ordenes',
  imports: [
    TableModule,
    PaginatorModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    TooltipModule,
    MenuModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './lista-ordenes.html',
  styleUrl: './lista-ordenes.scss',
})
export class ListaOrdenes implements OnInit {
  private readonly ordenService = inject(OrdenService);
  private readonly router = inject(Router);

  // Estado
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly ordenesPage = signal<PageResponse<OrdenDespachoSimple> | null>(null);
  protected readonly searchTerm = signal('');

  // Paginación (servidor)
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  // Datos para la tabla
  protected readonly ordenes = computed(() => {
    return this.ordenesPage()?.content || [];
  });

  protected readonly totalItems = computed(() => this.ordenesPage()?.totalElements || 0);

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  private cargarOrdenes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordenService.obtenerTodas(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.ordenesPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar órdenes:', err);
        this.error.set('No se pudieron cargar las órdenes. Por favor, intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.pageIndex.set(0);
  }

  protected onPageChange(event: PaginatorState): void {
    this.pageIndex.set(event.page || 0);
    this.pageSize.set(event.rows || 10);
    this.cargarOrdenes();
  }

  protected verDetalle(orden: OrdenDespachoSimple): void {
    this.router.navigate(['/ordenes', orden.idOrden]);
  }

  protected nuevaOrden(): void {
    this.router.navigate(['/ordenes/nueva']);
  }

  protected onRetry(): void {
    this.cargarOrdenes();
  }

  protected getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (estado) {
      case 'PENDIENTE': return 'warn';
      case 'EN_PREPARACION': return 'info';
      case 'LISTA': return 'success';
      case 'DESPACHADA': return 'success';
      case 'CANCELADA': return 'danger';
      default: return 'secondary';
    }
  }

  protected getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'EN_PREPARACION': 'En Preparación',
      'LISTA': 'Lista',
      'DESPACHADA': 'Despachada',
      'CANCELADA': 'Cancelada'
    };
    return labels[estado] || estado;
  }
}
