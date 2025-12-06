import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { DocumentoSalidaService } from '../../../../core/services/documento-salida.service';
import { CrearDocumentoSalidaDTO } from '../../../../core/models/crear-documento-salida-dto.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Ruta {
  idRuta: number;
  nombre: string;
}

interface Conductor {
  idConductor: number;
  nombre: string;
}

interface Orden {
  idOrden: number;
  numeroOrden: string;
  idCliente: number;
  nombreCliente?: string;
  total: number;
  fechaOrden: string;
  detalles: DetalleOrden[];
}

interface DetalleOrden {
  idProducto: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
}

interface ProductoConsolidado {
  idProducto: number;
  nombre: string;
  cantidadTotal: number;
  unidad: string;
}

@Component({
  selector: 'app-crear-documento-salida',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    TableModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './crear-documento.html',
  styleUrls: ['./crear-documento.scss']
})
export class CrearDocumentoComponent implements OnInit {
  private readonly documentoService = inject(DocumentoSalidaService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // Form
  rutaSeleccionada = signal<number | null>(null);
  conductorSeleccionado = signal<number | null>(null);
  fechaSalida = signal<Date>(new Date());
  observaciones = signal<string>('');

  // Data
  rutas = signal<any[]>([]);
  conductores = signal<any[]>([]);
  ordenesDisponibles = signal<Orden[]>([]);
  ordenesSeleccionadas = signal<Set<number>>(new Set());

  // Loading
  loading = signal(false);
  loadingOrdenes = signal(false);

  // Computed
  productosConsolidados = computed(() => {
    const seleccionadas = Array.from(this.ordenesSeleccionadas());
    const ordenes = this.ordenesDisponibles().filter(o => seleccionadas.includes(o.idOrden));

    const consolidado = new Map<number, ProductoConsolidado>();

    ordenes.forEach(orden => {
      orden.detalles.forEach(detalle => {
        const key = detalle.idProducto;
        if (consolidado.has(key)) {
          const prod = consolidado.get(key)!;
          prod.cantidadTotal += detalle.cantidad;
        } else {
          consolidado.set(key, {
            idProducto: detalle.idProducto,
            nombre: detalle.nombreProducto || `Producto ${detalle.idProducto}`,
            cantidadTotal: detalle.cantidad,
            unidad: 'Paq'
          });
        }
      });
    });

    return Array.from(consolidado.values());
  });

  totalDocumento = computed(() => {
    const seleccionadas = Array.from(this.ordenesSeleccionadas());
    const ordenes = this.ordenesDisponibles().filter(o => seleccionadas.includes(o.idOrden));
    return ordenes.reduce((sum, orden) => sum + orden.total, 0);
  });

  ngOnInit(): void {
    this.cargarRutas();
    this.cargarConductores();
  }

  cargarRutas(): void {
    this.http.get<Ruta[]>(`${environment.apiUrl}/rutas`)
      .subscribe({
        next: (rutas) => this.rutas.set(rutas),
        error: (error) => {
          console.error('Error cargando rutas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las rutas'
          });
        }
      });
  }

  cargarConductores(): void {
    this.http.get<Conductor[]>(`${environment.apiUrl}/conductores`)
      .subscribe({
        next: (conductores) => this.conductores.set(conductores),
        error: (error) => {
          console.error('Error cargando conductores:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los conductores'
          });
        }
      });
  }

  onRutaChange(): void {
    this.ordenesSeleccionadas.set(new Set());
    this.ordenesDisponibles.set([]);

    if (this.rutaSeleccionada()) {
      this.cargarOrdenesPendientes();
    }
  }

  cargarOrdenesPendientes(): void {
    const idRuta = this.rutaSeleccionada();
    if (!idRuta) return;

    this.loadingOrdenes.set(true);

    // Cargar órdenes PENDIENTES de clientes de la ruta
    this.http.get<any>(`${environment.apiUrl}/ordenes`, {
      params: { estado: 'PENDIENTE', page: '0', size: '100' }
    }).subscribe({
      next: (response) => {
        // Filtrar órdenes de clientes de la ruta seleccionada
        // Por ahora mostramos todas las pendientes
        this.ordenesDisponibles.set(response.content || []);
        this.loadingOrdenes.set(false);
      },
      error: (error) => {
        console.error('Error cargando órdenes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes'
        });
        this.loadingOrdenes.set(false);
      }
    });
  }

  toggleOrden(idOrden: number): void {
    const selected = new Set(this.ordenesSeleccionadas());
    if (selected.has(idOrden)) {
      selected.delete(idOrden);
    } else {
      selected.add(idOrden);
    }
    this.ordenesSeleccionadas.set(selected);
  }

  isOrdenSeleccionada(idOrden: number): boolean {
    return this.ordenesSeleccionadas().has(idOrden);
  }

  guardar(): void {
    if (!this.validar()) return;

    const dto: CrearDocumentoSalidaDTO = {
      idRuta: this.rutaSeleccionada()!,
      idConductor: this.conductorSeleccionado()!,
      idsOrdenes: Array.from(this.ordenesSeleccionadas()),
      fechaSalida: this.fechaSalida(),
      observaciones: this.observaciones() || undefined,
      idEmpleado: 1 // TODO: obtener del usuario logueado
    };

    this.loading.set(true);
    this.documentoService.crear(dto).subscribe({
      next: (documento) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Documento ${documento.numeroDocumento} creado exitosamente`
        });
        setTimeout(() => {
          this.router.navigate(['/inventario/documentos-salida', documento.id]);
        }, 1500);
      },
      error: (error) => {
        console.error('Error creando documento:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo crear el documento'
        });
        this.loading.set(false);
      }
    });
  }

  validar(): boolean {
    if (!this.rutaSeleccionada()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe seleccionar una ruta'
      });
      return false;
    }

    if (!this.conductorSeleccionado()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe seleccionar un conductor'
      });
      return false;
    }

    if (this.ordenesSeleccionadas().size === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe seleccionar al menos una orden'
      });
      return false;
    }

    return true;
  }

  cancelar(): void {
    this.router.navigate(['/inventario/documentos-salida']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }
}
