import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {TableModule} from 'primeng/table';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {TagModule} from 'primeng/tag';
import {TooltipModule} from 'primeng/tooltip';
import {MenuModule} from 'primeng/menu';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ToastModule} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';
import {FormsModule} from '@angular/forms';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {OrdenService} from '../../../core/services/orden.service';
import {OrdenDespachoSimple} from '../../../core/models/orden/ordenDespachoSimple';
import {PageResponse} from '../../../core/models/common/page-response';
import {Loading} from '../../../shared/components/loading/loading';
import {ErrorMessage} from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-lista-ordenes',
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
    ConfirmDialogModule,
    ToastModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    Loading,
    ErrorMessage
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './lista-ordenes.html',
  styleUrl: './lista-ordenes.scss',
})
export class ListaOrdenes implements OnInit, OnDestroy {
  private readonly ordenService = inject(OrdenService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Estado
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly ordenesPage = signal<PageResponse<OrdenDespachoSimple> | null>(null);
  protected readonly searchTerm = signal('');

  // Búsqueda
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Paginación (servidor)
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  // Datos para la tabla
  protected readonly ordenes = computed(() => {
    return this.ordenesPage()?.content || [];
  });

  protected readonly totalItems = computed(() => this.ordenesPage()?.totalElements || 0);

  ngOnInit(): void {
    // Configurar debounce para la búsqueda
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.pageIndex.set(0);
      this.cargarOrdenes();
    });

    this.cargarOrdenes();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private cargarOrdenes(): void {
    this.loading.set(true);
    this.error.set(null);

    // TODO: Agregar filtros de fecha y estado cuando se implementen en la UI
    this.ordenService.obtenerTodas(this.pageIndex(), this.pageSize(), this.searchTerm()).subscribe({
      next: (page) => {
        this.ordenesPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar órdenes:', err);
        this.error.set('No se pudieron cargar las órdenes. Por favor, intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  protected onPageChange(event: PaginatorState): void {
    this.pageIndex.set(event.page || 0);
    this.pageSize.set(event.rows || 10);
    this.cargarOrdenes();
  }

  protected verDetalle(orden: OrdenDespachoSimple): void {
    this.router.navigate(['/ordenes', orden.idOrden]);
  }

  protected nuevaOrden(): void {
    this.router.navigate(['/ordenes/nueva']);
  }

  protected onRetry(): void {
    this.cargarOrdenes();
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

  protected getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'EN_PREPARACION': 'En Preparación',
      'LISTA': 'Lista',
      'DESPACHADA': 'Despachada',
      'ENTREGADA': 'Entregada',
      'CANCELADA': 'Cancelada'
    };
    return labels[estado] || estado;
  }

  protected marcarEntregada(orden: OrdenDespachoSimple, event: Event): void {
    event.stopPropagation();

    this.confirmationService.confirm({
      message: `¿Estás seguro de marcar la orden ${orden.numeroOrden} como ENTREGADA?`,
      header: 'Confirmar Entrega',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Entregar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        import('../../../core/models/orden/estadoOrden').then(({EstadoOrden}) => {
          this.ordenService.cambiarEstado(orden.idOrden, EstadoOrden.ENTREGADA).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Orden marcada como entregada correctamente'
              });
              this.cargarOrdenes();
            },
            error: (err) => {
              console.error('Error al actualizar estado:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el estado de la orden'
              });
            }
          });
        });
      }
    });
  }
}
