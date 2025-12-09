import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente/cliente';
import { PageResponse } from '../../../core/models/common/page-response';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-lista-clientes',
  imports: [
    TableModule,
    PaginatorModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    TooltipModule,
    MenuModule,
    FormsModule,
    Loading,
    ErrorMessage
  ],
  templateUrl: './lista-clientes.html',
  styleUrl: './lista-clientes.scss',
})
export class ListaClientes implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  // Estado
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly clientesPage = signal<PageResponse<Cliente> | null>(null);
  protected readonly searchTerm = signal('');

  // Paginación (servidor)
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  // Datos para la tabla
  protected readonly clientes = computed(() => {
    return this.clientesPage()?.content || [];
  });

  protected readonly totalItems = computed(() => this.clientesPage()?.totalElements || 0);

  ngOnInit(): void {
    this.cargarClientes();
  }

  private cargarClientes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clienteService.obtenerTodos(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.clientesPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.error.set('No se pudieron cargar los clientes. Por favor, intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.pageIndex.set(0);
  }

  protected onPageChange(event: PaginatorState): void {
    this.pageIndex.set(event.page || 0);
    this.pageSize.set(event.rows || 10);
    this.cargarClientes();
  }

  protected verDetalle(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.idCliente]);
  }

  protected editarCliente(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.idCliente, 'editar']);
  }

  protected nuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  protected desactivarCliente(cliente: Cliente): void {
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
              this.cargarClientes();
            },
            error: (err) => {
              console.error('Error al desactivar cliente:', err);
            }
          });
        }
      }
    });
  }

  protected activarCliente(cliente: Cliente): void {
    this.confirmationService.confirm({
      header: 'Activar Cliente',
      message: `¿Estás seguro de que deseas activar el cliente "${cliente.nombre}"?`,
      icon: 'pi pi-check-circle',
      acceptLabel: 'Activar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        if (cliente.idCliente) {
          this.clienteService.activar(cliente.idCliente).subscribe({
            next: () => {
              this.cargarClientes();
            },
            error: (err) => {
              console.error('Error al activar cliente:', err);
            }
          });
        }
      }
    });
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
    // Example mapping, adjust as needed
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

  protected onRetry(): void {
    this.cargarClientes();
  }
}
