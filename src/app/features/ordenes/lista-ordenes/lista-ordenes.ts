import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { OrdenService } from '../../../core/services/orden.service';
import { OrdenDespachoSimple } from '../../../core/models/orden/ordenDespachoSimple';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-lista-ordenes',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
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
  protected readonly ordenes = signal<OrdenDespachoSimple[]>([]);
  protected readonly searchTerm = signal('');

  // Paginación
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  // Ordenamiento
  protected readonly sortColumn = signal<string>('fechaOrden');
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // Columnas de la tabla
  protected readonly displayedColumns: string[] = [
    'numeroOrden',
    'fechaOrden',
    'clienteNombre',
    'cantidadProductos',
    'total',
    'estado',
    'acciones'
  ];

  // Datos filtrados y ordenados
  protected readonly filteredData = computed(() => {
    let data = this.ordenes();

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      data = data.filter(o =>
        o.numeroOrden?.toString().includes(search) ||
        o.clienteNombre.toLowerCase().includes(search)
      );
    }

    // Ordenar
    const column = this.sortColumn();
    const direction = this.sortDirection();
    data = [...data].sort((a, b) => {
      let aValue: any = a[column as keyof OrdenDespachoSimple];
      let bValue: any = b[column as keyof OrdenDespachoSimple];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });

    return data;
  });

  // Datos paginados
  protected readonly paginatedData = computed(() => {
    const data = this.filteredData();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return data.slice(startIndex, endIndex);
  });

  protected readonly totalItems = computed(() => this.filteredData().length);

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  private cargarOrdenes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordenService.obtenerTodas().subscribe({
      next: (ordenes) => {
        this.ordenes.set(ordenes);
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

  protected onSort(sort: Sort): void {
    this.sortColumn.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc' || 'asc');
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
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

  protected getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'PENDIENTE': 'estado-pendiente',
      'EN_PREPARACION': 'estado-preparacion',
      'LISTA': 'estado-lista',
      'DESPACHADA': 'estado-despachada',
      'CANCELADA': 'estado-cancelada'
    };
    return classes[estado] || '';
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
