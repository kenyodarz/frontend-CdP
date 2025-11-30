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
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { ClienteService } from '../../../core/services/cliente.service';
import { ClienteSimple } from '../../../core/models/cliente/clienteSimple';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-lista-clientes',
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
    Loading,
    ErrorMessage
  ],
  templateUrl: './lista-clientes.html',
  styleUrl: './lista-clientes.scss',
})
export class ListaClientes implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Estado
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly clientes = signal<ClienteSimple[]>([]);
  protected readonly searchTerm = signal('');

  // Paginación
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  // Ordenamiento
  protected readonly sortColumn = signal<string>('nombre');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Columnas de la tabla
  protected readonly displayedColumns: string[] = [
    'codigo',
    'nombre',
    'telefono',
    'barrio',
    'ruta',
    'tipoTarifa',
    'estado',
    'acciones'
  ];

  // Datos filtrados y ordenados
  protected readonly filteredData = computed(() => {
    let data = this.clientes();

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      data = data.filter(c =>
        c.nombre.toLowerCase().includes(search) ||
        c.codigo?.toLowerCase().includes(search) ||
        c.telefono?.toLowerCase().includes(search) ||
        c.barrio?.toLowerCase().includes(search)
      );
    }

    // Ordenar
    const column = this.sortColumn();
    const direction = this.sortDirection();
    data = [...data].sort((a, b) => {
      let aValue: any = a[column as keyof ClienteSimple];
      let bValue: any = b[column as keyof ClienteSimple];

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
    this.cargarClientes();
  }

  private cargarClientes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clienteService.obtenerTodos().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.error.set('No se pudieron cargar los clientes. Por favor, intenta nuevamente.');
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

  protected verDetalle(cliente: ClienteSimple): void {
    this.router.navigate(['/clientes', cliente.idCliente]);
  }

  protected editarCliente(cliente: ClienteSimple): void {
    this.router.navigate(['/clientes', cliente.idCliente, 'editar']);
  }

  protected nuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  protected desactivarCliente(cliente: ClienteSimple): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar Cliente',
        message: `¿Estás seguro de que deseas desactivar el cliente "${cliente.nombre}"?`,
        confirmText: 'Desactivar',
        cancelText: 'Cancelar',
        confirmColor: 'warn',
        icon: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && cliente.idCliente) {
        this.clienteService.desactivar(cliente.idCliente).subscribe({
          next: () => {
            this.cargarClientes();
          },
          error: (err) => {
            console.error('Error al desactivar cliente:', err);
          }
        });
      }
    });
  }

  protected getTarifaLabel(tipoTarifa: string): string {
    const labels: Record<string, string> = {
      'PRECIO_0D': '0 Días',
      'PRECIO_5D': '5 Días',
      'PRECIO_10D': '10 Días',
      'PRECIO_ES': 'Especial',
      'PRECIO_JM': 'Jumbo',
      'PRECIO_CR': 'Crédito'
    };
    return labels[tipoTarifa] || tipoTarifa;
  }

  protected onRetry(): void {
    this.cargarClientes();
  }
}
