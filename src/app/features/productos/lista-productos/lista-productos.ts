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
import { CurrencyPipe } from '@angular/common';

import { ProductoService } from '../../../core/services/producto.service';
import { ProductoSimple } from '../../../core/models/producto/productoSimple';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-lista-productos',
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
    Loading,
    ErrorMessage
  ],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.scss',
})
export class ListaProductos implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Estado
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<ProductoSimple[]>([]);
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
    'stockActual',
    'stockMinimo',
    'precioVenta',
    'estado',
    'acciones'
  ];

  // Datos filtrados y ordenados
  protected readonly filteredData = computed(() => {
    let data = this.productos();

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      data = data.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.codigo?.toLowerCase().includes(search)
      );
    }

    // Ordenar
    const column = this.sortColumn();
    const direction = this.sortDirection();
    data = [...data].sort((a, b) => {
      let aValue: any = a[column as keyof ProductoSimple];
      let bValue: any = b[column as keyof ProductoSimple];

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
    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productoService.obtenerTodos().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error.set('No se pudieron cargar los productos. Por favor, intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.pageIndex.set(0); // Resetear a la primera página
  }

  protected onSort(sort: Sort): void {
    this.sortColumn.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc' || 'asc');
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected verDetalle(producto: ProductoSimple): void {
    this.router.navigate(['/productos', producto.idProducto]);
  }

  protected editarProducto(producto: ProductoSimple): void {
    this.router.navigate(['/productos', producto.idProducto, 'editar']);
  }

  protected nuevoProducto(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  // TODO: Implementar desactivación usando PUT con estado INACTIVO
  // El backend no tiene endpoint /desactivar, se debe usar PUT /productos/{id}
  // con el campo estado: 'INACTIVO'
  /*
  protected desactivarProducto(producto: ProductoSimple): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar Producto',
        message: `¿Estás seguro de que deseas desactivar el producto "${producto.nombre}"?`,
        confirmText: 'Desactivar',
        cancelText: 'Cancelar',
        confirmColor: 'warn',
        icon: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && producto.idProducto) {
        this.productoService.desactivar(producto.idProducto).subscribe({
          next: () => {
            this.cargarProductos();
          },
          error: (err) => {
            console.error('Error al desactivar producto:', err);
          }
        });
      }
    });
  }
  */

  protected getStockStatus(producto: ProductoSimple): 'bajo' | 'normal' {
    if (producto.stockBajo) return 'bajo';
    return 'normal';
  }

  protected onRetry(): void {
    this.cargarProductos();
  }
}
