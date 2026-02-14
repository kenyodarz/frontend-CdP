import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {TableModule} from 'primeng/table';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {TagModule} from 'primeng/tag';
import {TooltipModule} from 'primeng/tooltip';
import {MenuModule} from 'primeng/menu';
import {FormsModule} from '@angular/forms';
import {CurrencyPipe} from '@angular/common';
import {MenuItem} from 'primeng/api';

import {ProductoService} from '../../../core/services/producto.service';
import {PageResponse} from '../../../core/models/common/page-response';
import {Producto} from '../../../core/models/producto/producto';
import {Loading} from '../../../shared/components/loading/loading';
import {ErrorMessage} from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-lista-productos',
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
    Loading,
    ErrorMessage
  ],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.scss',
})
export class ListaProductos implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  // Estado
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly productosPage = signal<PageResponse<Producto> | null>(null);
  protected readonly searchTerm = signal('');

  // Paginación (servidor)
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  // Datos para la tabla (del servidor)
  protected readonly productos = computed(() => {
    return this.productosPage()?.content || [];
  });

  protected readonly totalItems = computed(() => this.productosPage()?.totalElements || 0);

  // Menu items for actions
  protected menuItems: MenuItem[] = [];
  protected selectedProducto: Producto | null = null;

  // Subject para manejar el debounce de búsqueda
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Configurar el debounce para la búsqueda
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.pageIndex.set(0); // Resetear a la primera página
      this.cargarProductos();
    });

    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.loading.set(true);
    this.error.set(null);

    // Usar paginación del servidor y término de búsqueda
    this.productoService.listarTodos(this.pageIndex(), this.pageSize(), this.searchTerm()).subscribe({
      next: (page) => {
        this.productosPage.set(page);
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
    this.searchSubject.next(value);
  }

  protected onPageChange(event: PaginatorState): void {
    this.pageIndex.set(event.page || 0);
    this.pageSize.set(event.rows || 10);
    this.cargarProductos(); // Recargar datos del servidor
  }

  protected verDetalle(producto: Producto): void {
    this.router.navigate(['/productos', producto.idProducto]);
  }

  protected editarProducto(producto: Producto): void {
    this.router.navigate(['/productos', producto.idProducto, 'editar']);
  }

  protected nuevoProducto(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  protected getStockSeverity(producto: Producto): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (producto.stockActual <= producto.stockMinimo) return 'warn';
    if (producto.stockActual === 0) return 'danger';
    return 'success';
  }

  protected getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'danger';
      default: return 'info';
    }
  }

  protected onRetry(): void {
    this.cargarProductos();
  }
}
