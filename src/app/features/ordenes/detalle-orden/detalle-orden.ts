import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { OrdenService } from '../../../core/services/orden.service';
import { OrdenDespacho } from '../../../core/models/orden/ordenDespacho';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-detalle-orden',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    CurrencyPipe,
    DatePipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './detalle-orden.html',
  styleUrl: './detalle-orden.scss',
})
export class DetalleOrden implements OnInit {
  private readonly ordenService = inject(OrdenService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly orden = signal<OrdenDespacho | null>(null);
  protected readonly displayedColumns = ['producto', 'cantidad', 'precioUnitario', 'subtotal'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarOrden(+id);
    }
  }

  private cargarOrden(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordenService.obtenerPorId(id).subscribe({
      next: (orden) => {
        this.orden.set(orden);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar orden:', err);
        this.error.set('No se pudo cargar la orden.');
        this.loading.set(false);
      }
    });
  }

  protected volver(): void {
    this.router.navigate(['/ordenes']);
  }

  protected cambiarEstado(nuevoEstado: string): void {
    const orden = this.orden();
    if (!orden || !orden.idOrden) return;

    this.ordenService.cambiarEstado(orden.idOrden, nuevoEstado as any).subscribe({
      next: (ordenActualizada) => {
        this.orden.set(ordenActualizada);
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
      }
    });
  }

  protected cancelarOrden(): void {
    const orden = this.orden();
    if (!orden || !orden.idOrden) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Cancelar Orden',
        message: `¿Estás seguro de que deseas cancelar la orden ${orden.numeroOrden}?`,
        confirmText: 'Cancelar Orden',
        cancelText: 'No',
        confirmColor: 'warn',
        icon: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && orden.idOrden) {
        this.ordenService.cancelar(orden.idOrden, 'Cancelada por el usuario').subscribe({
          next: (ordenActualizada) => {
            this.orden.set(ordenActualizada);
          },
          error: (err) => {
            console.error('Error al cancelar orden:', err);
          }
        });
      }
    });
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

  protected onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarOrden(+id);
    }
  }
}
