import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente/cliente';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-detalle-cliente',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
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
  private readonly dialog = inject(MatDialog);

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

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar Cliente',
        message: `¿Estás seguro de que deseas desactivar el cliente "${cliente.nombre}"?`,
        confirmText: 'Desactivar',
        cancelText: 'Cancelar',
        confirmColor: 'warn',
        icon: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && cliente.idCliente) {
        this.clienteService.desactivar(cliente.idCliente).subscribe({
          next: () => {
            this.volver();
          },
          error: (err) => {
            console.error('Error al desactivar cliente:', err);
          }
        });
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
