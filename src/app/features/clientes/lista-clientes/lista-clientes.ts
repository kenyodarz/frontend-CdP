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
import { Cliente } from '../../../core/models/cliente/cliente';
import { PageResponse } from '../../../core/models/common/page-response';
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
  protected readonly clientesPage = signal<PageResponse<Cliente> | null>(null);
  protected readonly searchTerm = signal('');

  // Paginación (servidor)
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  // Ordenamiento (cliente)
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

  // Datos para la tabla
  protected readonly clientes = computed(() => {
    return this.clientesPage()?.content || [];
  });

  // Datos ordenados
  protected readonly sortedData = computed(() => {
    let data = this.clientes();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    if (!column) return data;

    return [...data].sort((a, b) => {
      let aValue: any = a[column as keyof Cliente];
      let bValue: any = b[column as keyof Cliente];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  protected readonly totalItems = computed(() => this.clientesPage()?.totalElements || 0);

  ngOnInit(): void {
    this.cargarClientes();
  }

  private cargarClientes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clienteService.obtenerTodos(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.clientesPage.set(page);
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
    this.cargarClientes();
  }

  protected verDetalle(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.idCliente]);
  }

  protected editarCliente(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.idCliente, 'editar']);
  }

  protected nuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  protected desactivarCliente(cliente: Cliente): void {
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
      'PRECIO_0D': 'Normal',
      'PRECIO_5D': '5% de Descuento',
      'PRECIO_10D': '10% de Descuento',
      'PRECIO_ES': '15% de Descuento',
      'PRECIO_JM': 'Especial 1',
      'PRECIO_CR': 'Especial 2'
    };
    return labels[tipoTarifa] || tipoTarifa;
  }

  protected onRetry(): void {
    this.cargarClientes();
  }
}
