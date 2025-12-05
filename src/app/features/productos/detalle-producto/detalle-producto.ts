import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CurrencyPipe } from '@angular/common';

import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-detalle-producto',
  imports: [
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    CurrencyPipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.scss',
})
export class DetalleProducto implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly producto = signal<Producto | null>(null);

  protected readonly preciosArray = computed(() => {
    const prod = this.producto();
    if (!prod) return [];
    return Object.entries(prod.precios).map(([key, value]) => ({
      tipoTarifa: key,
      precio: value
    }));
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(+id);
    }
  }

  private cargarProducto(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productoService.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.error.set('No se pudo cargar el producto.');
        this.loading.set(false);
      }
    });
  }

  protected editar(): void {
    const producto = this.producto();
    if (producto) {
      this.router.navigate(['/productos', producto.idProducto, 'editar']);
    }
  }

  protected volver(): void {
    this.router.navigate(['/productos']);
  }

  // TODO: Implementar desactivación usando PUT con estado INACTIVO
  // El backend no tiene endpoint /desactivar, se debe usar PUT /productos/{id}
  // con el campo estado: 'INACTIVO'
  /*
  protected desactivar(): void {
    // ... implementation with ConfirmationService ...
  }
  */

  protected getStockSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    const producto = this.producto();
    if (!producto) return 'info';

    if (producto.stockActual <= producto.stockMinimo) return 'warn';
    if (producto.stockMaximo && producto.stockActual >= producto.stockMaximo * 0.8) return 'success'; // Alto stock is good? Or bad? Assuming good or normal.
    // If stock is 0, danger
    if (producto.stockActual === 0) return 'danger';

    return 'info'; // Normal
  }

  protected getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'danger';
      default: return 'info';
    }
  }

  protected onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(+id);
    }
  }

  protected getTarifaLabel(tipoTarifa: string): string {
    const labels: Record<string, string> = {
      'PRECIO_0D': 'Precio Normal',
      'PRECIO_5D': '5% de Descuento',
      'PRECIO_10D': '10% de Descuento',
      'PRECIO_ES': '15% de Descuento',
      'PRECIO_JM': 'Especial 1',
      'PRECIO_CR': 'Especial 2',
      '0D': 'Normal', // La D quiere decir descuento: 0% de descuento
      '5D': '5% de Descuento', // La D quiere decir descuento: 5% de Descuento
      '10D': '10% de Descuento', // La D quiere decir descuento: 10% de Descuento
      'ES': '15% de Descuento',
      'JM': 'Especial 1',
      'CR': 'Especial 2'
    };
    return labels[tipoTarifa] || tipoTarifa;
  }
}
