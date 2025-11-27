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
import { DatePipe } from '@angular/common';

import { InventarioService } from '../../../core/services/inventario.service';
import { Lote } from '../../../core/models/inventario/lote';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-lotes',
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
    DatePipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './lotes.html',
  styleUrl: './lotes.scss',
})
export class Lotes implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly searchTerm = signal('');

  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly sortColumn = signal<string>('fechaElaboracion');
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');

  protected readonly displayedColumns: string[] = [
    'codigoLote',
    'productoNombre',
    'cantidadInicial',
    'cantidadActual',
    'fechaElaboracion',
    'fechaVencimiento',
    'estado',
    'acciones'
  ];

  protected readonly filteredData = computed(() => {
    let data = this.lotes();

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      data = data.filter(l =>
        l.codigoLote.toLowerCase().includes(search) ||
        l.productoNombre.toLowerCase().includes(search)
      );
    }

    const column = this.sortColumn();
    const direction = this.sortDirection();
    data = [...data].sort((a, b) => {
      let aValue: any = a[column as keyof Lote];
      let bValue: any = b[column as keyof Lote];

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
    this.cargarLotes();
  }

  private cargarLotes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.inventarioService.obtenerProximosAVencer(365).subscribe({
      next: (lotes) => {
        this.lotes.set(lotes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar lotes:', err);
        this.error.set('No se pudieron cargar los lotes.');
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

  protected nuevoLote(): void {
    this.router.navigate(['/inventario/lotes/nuevo']);
  }

  protected onRetry(): void {
    this.cargarLotes();
  }

  protected getEstadoLote(lote: Lote): 'vencido' | 'proximo-vencer' | 'activo' | 'agotado' {
    if (lote.cantidadActual === 0) return 'agotado';
    if (lote.estaVencido) return 'vencido';
    if (lote.estaProximoAVencer) return 'proximo-vencer';
    return 'activo';
  }

  protected getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'vencido': 'estado-vencido',
      'proximo-vencer': 'estado-proximo-vencer',
      'activo': 'estado-activo',
      'agotado': 'estado-agotado'
    };
    return classes[estado] || '';
  }

  protected getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'vencido': 'Vencido',
      'proximo-vencer': 'Próximo a Vencer',
      'activo': 'Activo',
      'agotado': 'Agotado'
    };
    return labels[estado] || estado;
  }
}
