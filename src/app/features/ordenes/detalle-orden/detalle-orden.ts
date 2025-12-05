import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { OrdenService } from '../../../core/services/orden.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { ProductoService } from '../../../core/services/producto.service';
import { OrdenDespacho } from '../../../core/models/orden/ordenDespacho';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

interface DetalleOrdenViewModel {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface OrdenViewModel extends Omit<OrdenDespacho, 'detalles'> {
  clienteNombre: string;
  empleadoNombre: string;
  detalles: DetalleOrdenViewModel[];
}

@Component({
  selector: 'app-detalle-orden',
  imports: [
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    TooltipModule,
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
  private readonly clienteService = inject(ClienteService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly orden = signal<OrdenViewModel | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarOrden(+id);
    }
  }

  private cargarOrden(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordenService.obtenerPorId(id).pipe(
      switchMap(orden => {
        // 1. Obtener Cliente
        const cliente$ = this.clienteService.obtenerPorId(orden.idCliente).pipe(
          map(c => c.nombre),
          catchError(() => of('Cliente no encontrado'))
        );

        // 2. Obtener Empleado
        const empleado$ = this.empleadoService.obtenerPorId(orden.idEmpleado).pipe(
          map(e => e.nombreCompleto || e.nombre || 'Empleado'),
          catchError(() => of('Empleado no encontrado'))
        );

        // 3. Obtener nombres de productos para cada detalle
        const detalles$ = forkJoin(
          orden.detalles.map(d =>
            this.productoService.obtenerPorId(d.idProducto).pipe(
              map(p => ({
                producto: p.nombre,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
                subtotal: d.subtotal
              })),
              catchError(() => of({
                producto: 'Producto no encontrado',
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
                subtotal: d.subtotal
              }))
            )
          )
        );

        return forkJoin({
          clienteNombre: cliente$,
          empleadoNombre: empleado$,
          detallesView: detalles$
        }).pipe(
          map(results => ({
            ...orden,
            clienteNombre: results.clienteNombre,
            empleadoNombre: results.empleadoNombre,
            detalles: results.detallesView
          }))
        );
      })
    ).subscribe({
      next: (ordenView) => {
        this.orden.set(ordenView);
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
      next: () => {
        this.cargarOrden(orden.idOrden!);
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
      }
    });
  }

  protected cancelarOrden(): void {
    const orden = this.orden();
    if (!orden || !orden.idOrden) return;

    this.confirmationService.confirm({
      header: 'Cancelar Orden',
      message: `¿Estás seguro de que deseas cancelar la orden ${orden.numeroOrden}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar Orden',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (orden.idOrden) {
          this.ordenService.cancelar(orden.idOrden, 'Cancelada por el usuario').subscribe({
            next: () => {
              this.cargarOrden(orden.idOrden!);
            },
            error: (err) => {
              console.error('Error al cancelar orden:', err);
            }
          });
        }
      }
    });
  }

  protected getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (estado) {
      case 'PENDIENTE': return 'warn';
      case 'EN_PREPARACION': return 'info';
      case 'LISTA': return 'success';
      case 'DESPACHADA': return 'success';
      case 'CANCELADA': return 'danger';
      default: return 'secondary';
    }
  }

  protected onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarOrden(+id);
    }
  }
}
