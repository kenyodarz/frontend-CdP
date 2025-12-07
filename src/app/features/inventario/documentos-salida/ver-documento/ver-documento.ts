import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { DocumentoSalida } from '../../../../core/models/documento-salida.model';
import { DocumentoSalidaService } from '../../../../core/services/documento-salida.service';
import { EstadoDocumentoSalida, ESTADO_LABELS, ESTADO_SEVERITIES } from '../../../../core/models/estado-documento-salida.enum';
import { ValidacionStockResult } from '../../../../core/models/validacion-stock-result.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-documento-salida',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ver-documento.html',
  styleUrls: ['./ver-documento.scss']
})
export class VerDocumentoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly documentoService = inject(DocumentoSalidaService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  documento = signal<DocumentoSalida | null>(null);
  loading = signal(false);

  // Dialogs
  mostrarDialogEstado = signal(false);
  mostrarDialogValidacion = signal(false);
  validacionResult = signal<ValidacionStockResult | null>(null);

  // Estados
  EstadoDocumentoSalida = EstadoDocumentoSalida;
  estadoSeleccionado = signal<EstadoDocumentoSalida | null>(null);

  // Computed
  get estadosPermitidos(): EstadoDocumentoSalida[] {
    const estadoActual = this.documento()?.estado;
    if (!estadoActual) return [];

    switch (estadoActual) {
      case EstadoDocumentoSalida.PENDIENTE:
        return [EstadoDocumentoSalida.EN_PREPARACION, EstadoDocumentoSalida.CANCELADO];
      case EstadoDocumentoSalida.EN_PREPARACION:
        return [EstadoDocumentoSalida.LISTO, EstadoDocumentoSalida.PENDIENTE];
      default:
        return [];
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDocumento(+id);
    }
  }

  cargarDocumento(id: number): void {
    this.loading.set(true);
    this.documentoService.obtenerPorId(id).subscribe({
      next: (doc) => {
        this.documento.set(doc);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando documento:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el documento'
        });
        this.loading.set(false);
      }
    });
  }

  validarStock(): void {
    const id = this.documento()?.id;
    if (!id) return;

    this.loading.set(true);
    this.documentoService.validarStock(id).subscribe({
      next: (result) => {
        this.validacionResult.set(result);
        this.mostrarDialogValidacion.set(true);
        this.loading.set(false);

        if (result.valido) {
          this.messageService.add({
            severity: 'success',
            summary: 'Stock Válido',
            detail: 'Hay suficiente stock para todos los productos'
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Stock Insuficiente',
            detail: `Faltan ${result.productosFaltantes.length} productos`
          });
        }
      },
      error: (error) => {
        console.error('Error validando stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo validar el stock'
        });
        this.loading.set(false);
      }
    });
  }

  abrirDialogCambiarEstado(): void {
    this.estadoSeleccionado.set(null);
    this.mostrarDialogEstado.set(true);
  }

  cambiarEstado(): void {
    const id = this.documento()?.id;
    const nuevoEstado = this.estadoSeleccionado();
    if (!id || !nuevoEstado) return;

    const idEmpleado = 1; // TODO: obtener del usuario logueado

    this.loading.set(true);
    this.documentoService.cambiarEstado(id, nuevoEstado, idEmpleado).subscribe({
      next: (doc) => {
        this.documento.set(doc);
        this.mostrarDialogEstado.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Estado Cambiado',
          detail: `Estado actualizado a ${ESTADO_LABELS[nuevoEstado]}`
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cambiando estado:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo cambiar el estado'
        });
        this.loading.set(false);
      }
    });
  }

  despachar(): void {
    const id = this.documento()?.id;
    if (!id) return;

    this.confirmationService.confirm({
      message: '¿Confirma el despacho de este documento? Esta acción generará movimientos de inventario.',
      header: 'Confirmar Despacho',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Despachar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const idEmpleado = 1; // TODO: obtener del usuario logueado
        this.loading.set(true);

        this.documentoService.despachar(id, idEmpleado).subscribe({
          next: (doc) => {
            this.documento.set(doc);
            this.messageService.add({
              severity: 'success',
              summary: 'Despachado',
              detail: 'Documento despachado exitosamente'
            });
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error despachando:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'No se pudo despachar el documento'
            });
            this.loading.set(false);
          }
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/inventario/documentos-salida']);
  }

  getEstadoLabel(estado: EstadoDocumentoSalida): string {
    return ESTADO_LABELS[estado];
  }

  getEstadoSeverity(estado: EstadoDocumentoSalida):
    'warn' | 'info' | 'success' | 'secondary' | 'danger' | null {

    return ESTADO_SEVERITIES[estado] ?? null;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  getEstadosOptions() {
    return this.estadosPermitidos.map(estado => ({
      label: ESTADO_LABELS[estado],
      value: estado
    }));
  }

  descargarPdf(): void {
    const id = this.documento()?.id;
    const numeroDocumento = this.documento()?.numeroDocumento;
    if (!id) return;

    this.loading.set(true);
    this.documentoService.descargarPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${numeroDocumento || 'documento'}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'PDF Descargado',
          detail: 'El PDF se ha descargado correctamente'
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error descargando PDF:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar el PDF'
        });
        this.loading.set(false);
      }
    });
  }
}
