import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TagModule} from 'primeng/tag';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TooltipModule} from 'primeng/tooltip';

import {OrdenService} from '../../core/services/orden.service';
import {EstadoOrden} from '../../core/models/orden/estadoOrden';
import {OrdenDespachoSimple} from '../../core/models/orden/ordenDespachoSimple';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  templateUrl: './pagos.html',
  styleUrl: './pagos.scss',
  providers: [MessageService, ConfirmationService]
})
export class PagosComponent implements OnInit {
  private ordenService = inject(OrdenService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  ordenes = signal<OrdenDespachoSimple[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.cargarOrdenesEntregadas();
  }

  cargarOrdenesEntregadas() {
    this.loading.set(true);
    this.ordenService.obtenerPorEstado(EstadoOrden.ENTREGADA).subscribe({
      next: (data) => {
        this.ordenes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes pendientes de pago'
        });
        this.loading.set(false);
      }
    });
  }

  marcarComoPagada(orden: OrdenDespachoSimple) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas marcar la orden ${orden.numeroOrden} como PAGADA?`,
      header: 'Confirmar Pago',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Pagada',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.procesarPago(orden);
      }
    });
  }

  private procesarPago(orden: OrdenDespachoSimple) {
    this.loading.set(true);
    this.ordenService.cambiarEstado(orden.idOrden, EstadoOrden.PAGADA).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Pago Registrado',
          detail: `La orden ${orden.numeroOrden} ha sido marcada como Pagada.`
        });
        // Remove from list
        this.ordenes.update(current => current.filter(o => o.idOrden !== orden.idOrden));
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar el pago'
        });
        this.loading.set(false);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO');
  }
}
