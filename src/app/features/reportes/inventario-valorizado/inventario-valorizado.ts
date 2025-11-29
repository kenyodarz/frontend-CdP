import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CurrencyPipe } from '@angular/common';

import { ReporteService } from '../../../core/services/reporte.service';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

interface ProductoValorizado {
  idProducto: number;
  codigo: string;
  nombre: string;
  stockActual: number;
  precioPromedio: number;
  valorTotal: number;
}

@Component({
  selector: 'app-inventario-valorizado',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    CurrencyPipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './inventario-valorizado.html',
  styleUrl: './inventario-valorizado.scss',
})
export class InventarioValorizado implements OnInit {
  private readonly reporteService = inject(ReporteService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<ProductoValorizado[]>([]);

  protected readonly sortColumn = signal<string>('nombre');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  protected readonly displayedColumns: string[] = [
    'codigo',
    'nombre',
    'stockActual',
    'precioPromedio',
    'valorTotal'
  ];

  protected readonly sortedData = computed(() => {
    const data = [...this.productos()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return data.sort((a, b) => {
      let aValue: any = a[column as keyof ProductoValorizado];
      let bValue: any = b[column as keyof ProductoValorizado];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  protected readonly totalValorizado = computed(() => {
    return this.productos().reduce((sum, p) => sum + p.valorTotal, 0);
  });

  protected readonly totalProductos = computed(() => {
    return this.productos().length;
  });

  protected readonly totalUnidades = computed(() => {
    return this.productos().reduce((sum, p) => sum + p.stockActual, 0);
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reporteService.inventarioValorizado().subscribe({
      next: (data: any) => {
        // Convertir datos del servicio al formato esperado
        const productosValorizados: ProductoValorizado[] = data.productos || [];
        this.productos.set(productosValorizados);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar inventario valorizado:', err);
        this.error.set('No se pudo cargar el inventario valorizado.');
        this.loading.set(false);
      }
    });
  }

  protected onSort(sort: Sort): void {
    this.sortColumn.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc' || 'asc');
  }

  protected exportar(): void {
    // TODO: Implementar exportación a Excel
    console.log('Exportar inventario:', this.productos());
  }

  protected onRetry(): void {
    this.cargarDatos();
  }
}
