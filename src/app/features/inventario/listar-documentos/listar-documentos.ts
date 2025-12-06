import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule  } from 'primeng/table';
import {Button, ButtonDirective} from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { DocumentoRecepcionService } from '../../../core/services/documento-recepcion.service';
import { DocumentoRecepcion } from '../../../core/models/inventario/documento-recepcion';

interface EstadoOption {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-listar-documentos',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    DatePicker,
    Select,
    Tag,
    ButtonDirective
  ],
  templateUrl: './listar-documentos.html',
  styleUrl: './listar-documentos.scss',
  standalone: true
})
export class ListarDocumentos implements OnInit {
  private documentoService = inject(DocumentoRecepcionService);
  private messageService = inject(MessageService);

  documentos = signal<DocumentoRecepcion[]>([]);
  loading = signal(false);

  // Filtros
  fechaInicio = signal<Date>(new Date()); // Default: hoy
  fechaFin = signal<Date>(new Date());     // Default: hoy
  estadoSeleccionado = signal<string | null>(null);

  estadosOptions: EstadoOption[] = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Confirmado', value: 'CONFIRMADO' },
    { label: 'Revisado', value: 'REVISADO' },
    { label: 'Cerrado', value: 'CERRADO' },
    { label: 'Corregido', value: 'CORREGIDO' },
    { label: 'Con Ajustes', value: 'CON_AJUSTES' },
    { label: 'Anulado', value: 'ANULADO' }
  ];

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.loading.set(true);

    const fechaInicioStr = this.formatDate(this.fechaInicio());
    const fechaFinStr = this.formatDate(this.fechaFin());

    this.documentoService.listar(
      this.estadoSeleccionado(),
      fechaInicioStr,
      fechaFinStr
    ).subscribe({
      next: (documentos) => {
        this.documentos.set(documentos);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar documentos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los documentos'
        });
        this.loading.set(false);
      }
    });
  }

  private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onFiltroChange(): void {
    this.cargarDocumentos();
  }

  confirmarDocumento(id: number): void {
    this.loading.set(true);
    this.documentoService.confirmar(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Confirmado',
          detail: 'Documento confirmado exitosamente'
        });
        this.cargarDocumentos();
      },
      error: (error) => {
        console.error('Error al confirmar:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo confirmar el documento'
        });
        this.loading.set(false);
      }
    });
  }

  revisarDocumento(id: number): void {
    this.loading.set(true);
    this.documentoService.revisar(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Revisado',
          detail: 'Documento revisado exitosamente'
        });
        this.cargarDocumentos();
      },
      error: (error) => {
        console.error('Error al revisar:', error);
        this.messageService.add({
          severity: 'error',
          detail: 'No se pudo revisar el documento'
        });
        this.loading.set(false);
      }
    });
  }

  getSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severityMap: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'PENDIENTE': 'warn',
      'CONFIRMADO': 'info',
      'REVISADO': 'success',
      'CERRADO': 'secondary',
      'CORREGIDO': 'info',
      'CON_AJUSTES': 'info',
      'ANULADO': 'danger'
    };
    return severityMap[estado] || 'secondary';
  }

  puedeConfirmar(documento: DocumentoRecepcion): boolean {
    return documento.estado === 'PENDIENTE';
  }

  puedeRevisar(documento: DocumentoRecepcion): boolean {
    return documento.estado === 'CONFIRMADO';
  }

  puedeCorregir(documento: DocumentoRecepcion): boolean {
    return documento.estado === 'CONFIRMADO';
  }
}
