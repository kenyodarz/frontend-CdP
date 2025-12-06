import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { DocumentoSalida } from '../../../core/models/documento-salida.model';
import { EstadoDocumentoSalida, ESTADO_LABELS, ESTADO_SEVERITIES } from '../../../core/models/estado-documento-salida.enum';
import { DocumentoSalidaService } from '../../../core/services/documento-salida.service';

@Component({
  selector: 'app-documentos-salida',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    CardModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './documentos-salida.html',
  styleUrls: ['./documentos-salida.scss']
})
export class DocumentosSalidaComponent implements OnInit {
  private readonly documentoService = inject(DocumentoSalidaService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  documentos = signal<DocumentoSalida[]>([]);
  loading = signal(false);

  // Filtros
  estadoFiltro = signal<EstadoDocumentoSalida | null>(null);
  fechaInicio = signal<Date | null>(null);
  fechaFin = signal<Date | null>(null);

  // Opciones dropdown
  estadosOptions: any[] | undefined = Object.values(EstadoDocumentoSalida).map(estado => ({
    label: ESTADO_LABELS[estado],
    value: estado
  }));

  // Helpers
  getEstadoLabel = (estado: EstadoDocumentoSalida) => ESTADO_LABELS[estado];
  getEstadoSeverity = (estado: EstadoDocumentoSalida) => ESTADO_SEVERITIES[estado];

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.loading.set(true);
    this.documentoService
      .listar(
        this.estadoFiltro() ?? undefined,
        this.fechaInicio() ?? undefined,
        this.fechaFin() ?? undefined
      )
      .subscribe({
        next: (docs) => {
          this.documentos.set(docs);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error cargando documentos:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los documentos'
          });
          this.loading.set(false);
        }
      });
  }

  aplicarFiltros(): void {
    this.cargarDocumentos();
  }

  limpiarFiltros(): void {
    this.estadoFiltro.set(null);
    this.fechaInicio.set(null);
    this.fechaFin.set(null);
    this.cargarDocumentos();
  }

  nuevoDocumento(): void {
    this.router.navigate(['/inventario/documentos-salida/crear']);
  }

  verDocumento(documento: DocumentoSalida): void {
    this.router.navigate(['/inventario/documentos-salida', documento.id]);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CO');
  }
}
