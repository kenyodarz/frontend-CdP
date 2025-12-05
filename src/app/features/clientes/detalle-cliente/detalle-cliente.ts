import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente/cliente';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-detalle-cliente',
  imports: [
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    TooltipModule,
    Loading,
    ErrorMessage
  ],
  templateUrl: './detalle-cliente.html',
  styleUrl: './detalle-cliente.scss',
})
export class DetalleCliente implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly cliente = signal<Cliente | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarCliente(+id);
    }
  }

  private cargarCliente(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.clienteService.obtenerPorId(id).subscribe({
      next: (cliente) => {
        this.cliente.set(cliente);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar cliente:', err);
        this.error.set('No se pudo cargar el cliente.');
        this.loading.set(false);
      }
    });
  }

  protected editar(): void {
    const cliente = this.cliente();
    if (cliente) {
      this.router.navigate(['/clientes', cliente.idCliente, 'editar']);
    }
  }

  protected volver(): void {
    this.router.navigate(['/clientes']);
  }

  protected desactivar(): void {
    const cliente = this.cliente();
    if (!cliente) return;

    this.confirmationService.confirm({
      header: 'Desactivar Cliente',
      message: `¿Estás seguro de que deseas desactivar el cliente "${cliente.nombre}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (cliente.idCliente) {
          this.clienteService.desactivar(cliente.idCliente).subscribe({
            next: () => {
              this.volver();
            },
            error: (err) => {
              console.error('Error al desactivar cliente:', err);
            }
          });
        }
      }
    });
  }

  protected onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarCliente(+id);
    }
  }

  protected getTarifaLabel(tipoTarifa: string): string {
    const labels: Record<string, string> = {
      'PRECIO_0D': 'Normal',
      'PRECIO_5D': '5% Desc.',
      'PRECIO_10D': '10% Desc.',
      'PRECIO_ES': '15% Desc.',
      'PRECIO_JM': 'Especial 1',
      'PRECIO_CR': 'Especial 2'
    };
    return labels[tipoTarifa] || tipoTarifa;
  }

  protected getTarifaSeverity(tipoTarifa: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (tipoTarifa) {
      case 'PRECIO_0D': return 'info';
      case 'PRECIO_5D': return 'success';
      case 'PRECIO_10D': return 'success';
      case 'PRECIO_ES': return 'warn';
      default: return 'secondary';
    }
  }

  protected getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'danger';
      default: return 'info';
    }
  }
}
