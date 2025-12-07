import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { InventarioService } from '../../../core/services/inventario.service';
import { CierreInventario } from '../../../core/models/inventario/cierreInventario';

@Component({
  selector: 'app-cierres',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
    ProgressSpinnerModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './cierres.html',
  styleUrl: './cierres.css'
})
export class CierresComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly messageService = inject(MessageService);

  cierres: CierreInventario[] = [];
  periodoSeleccionado: string = this.getCurrentPeriod();
  loading = false;
  ejecutandoCierre = false;

  ngOnInit(): void {
    this.cargarCierres();
  }

  cargarCierres(): void {
    this.loading = true;

    this.inventarioService.listarCierresPorPeriodo(this.periodoSeleccionado).subscribe({
      next: (cierres) => {
        this.cierres = cierres;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando cierres:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los cierres'
        });
        this.loading = false;
      }
    });
  }

  ejecutarCierre(): void {
    const idUsuario = 1; // TODO: Get from auth service

    this.ejecutandoCierre = true;

    this.inventarioService.ejecutarCierreMensual(this.periodoSeleccionado, idUsuario).subscribe({
      next: (cierres) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cierre Exitoso',
          detail: `Se crearon ${cierres.length} cierres para el período ${this.periodoSeleccionado}`
        });
        this.cierres = cierres;
        this.ejecutandoCierre = false;
      },
      error: (error) => {
        console.error('Error ejecutando cierre:', error);
        let detail = 'No se pudo ejecutar el cierre';

        if (error.status === 409 || error.error?.includes('Ya existe')) {
          detail = 'Ya existe un cierre para este período';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail
        });
        this.ejecutandoCierre = false;
      }
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  getSeverity(estado: string): 'success' | 'info' | 'danger' | 'warn' {
    return estado === 'ACTIVO' ? 'success' : 'warn';
  }
}
