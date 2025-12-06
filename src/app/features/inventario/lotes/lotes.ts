import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePipe } from '@angular/common';

import { InventarioService } from '../../../core/services/inventario.service';
import { Lote } from '../../../core/models/inventario/lote';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-lotes',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    TooltipModule,
    DatePipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './lotes.html',
  styleUrl: './lotes.scss',
})
export class Lotes implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly lotes = signal<Lote[]>([]);

  ngOnInit(): void {
    this.cargarLotes();
  }

  private cargarLotes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.inventarioService.obtenerTodosLotes().subscribe({
      next: (lotes) => {
        this.lotes.set(lotes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar lotes:', err);
        this.error.set('No se pudieron cargar los lotes.');
        this.loading.set(false);
      }
    });
  }

  protected nuevoLote(): void {
    this.router.navigate(['/inventario/crear-lote']);
  }

  protected onRetry(): void {
    this.cargarLotes();
  }

  protected getEstadoLote(lote: Lote): 'vencido' | 'proximo-vencer' | 'activo' | 'agotado' {
    // Ahora solo verificamos el estado del lote
    if (lote.estado === 'VENCIDO') return 'vencido';
    if (lote.estado === 'ANULADO') return 'agotado';
    return 'activo';
  }

  protected getEstadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      'vencido': 'danger',
      'proximo-vencer': 'warn',
      'activo': 'success',
      'agotado': 'secondary'
    };
    return severities[estado] || 'secondary';
  }

  protected getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'vencido': 'Vencido',
      'proximo-vencer': 'Próximo a Vencer',
      'activo': 'Activo',
      'agotado': 'Agotado'
    };
    return labels[estado] || estado;
  }
}
