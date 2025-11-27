import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { InventarioService } from '../../../core/services/inventario.service';
import { MovimientoInventario } from '../../../core/models/inventario/movimientoInventario';
import { TipoMovimiento } from '../../../core/models/inventario/tipoMovimiento';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-movimientos',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    FormsModule,
    DatePipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.scss',
})
export class Movimientos implements OnInit {
  private readonly inventarioService = inject(InventarioService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly movimientos = signal<MovimientoInventario[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly tipoFiltro = signal<TipoMovimiento | ''>('');

  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly sortColumn = signal<string>('fechaMovimiento');
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');

  protected readonly tiposMovimiento = ['ENTRADA', 'SALIDA', 'AJUSTE'];

  protected readonly displayedColumns: string[] = [
    'fechaMovimiento',
    'tipoMovimiento',
    'productoNombre',
    'loteCodigoLote',
    'cantidad',
    'stockAnterior',
    'stockNuevo',
    'motivo'
  ];

  protected readonly filteredData = computed(() => {
    let data = this.movimientos();

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      data = data.filter(m =>
        m.productoNombre.toLowerCase().includes(search) ||
        m.loteCodigoLote?.toLowerCase().includes(search) ||
        m.motivo?.toLowerCase().includes(search)
      );
    }

    const tipo = this.tipoFiltro();
    if (tipo) {
      data = data.filter(m => m.tipoMovimiento === tipo);
    }

    const column = this.sortColumn();
    const direction = this.sortDirection();
    data = [...data].sort((a, b) => {
      let aValue: any = a[column as keyof MovimientoInventario];
      let bValue: any = b[column as keyof MovimientoInventario];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });

    return data;
  });

  protected readonly paginatedData = computed(() => {
    const data = this.filteredData();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return data.slice(startIndex, endIndex);
  });

  protected readonly totalItems = computed(() => this.filteredData().length);

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  private cargarMovimientos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.inventarioService.obtenerMovimientos().subscribe({
      next: (movimientos) => {
        this.movimientos.set(movimientos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
        this.error.set('No se pudieron cargar los movimientos.');
        this.loading.set(false);
      }
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.pageIndex.set(0);
  }

  protected onTipoChange(): void {
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

  protected onRetry(): void {
    this.cargarMovimientos();
  }

  protected getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      'ENTRADA': 'tipo-entrada',
      'SALIDA': 'tipo-salida',
      'AJUSTE': 'tipo-ajuste'
    };
    return classes[tipo] || '';
  }

  protected getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'ENTRADA': 'Entrada',
      'SALIDA': 'Salida',
      'AJUSTE': 'Ajuste'
    };
    return labels[tipo] || tipo;
  }

  protected getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'ENTRADA': 'arrow_downward',
      'SALIDA': 'arrow_upward',
      'AJUSTE': 'sync_alt'
    };
    return icons[tipo] || 'help';
  }
}
