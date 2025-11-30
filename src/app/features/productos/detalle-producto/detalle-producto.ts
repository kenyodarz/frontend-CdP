import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';

import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-detalle-producto',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
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
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly producto = signal<Producto | null>(null);

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

  protected desactivar(): void {
    const producto = this.producto();
    if (!producto) return;

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
            this.volver();
          },
          error: (err) => {
            console.error('Error al desactivar producto:', err);
          }
        });
      }
    });
  }

  protected getStockStatus(): 'bajo' | 'normal' | 'alto' {
    const producto = this.producto();
    if (!producto) return 'normal';

    if (producto.stockBajo) return 'bajo';
    if (producto.stockMaximo && producto.stockActual >= producto.stockMaximo * 0.8) return 'alto';
    return 'normal';
  }

  protected onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(+id);
    }
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
}
