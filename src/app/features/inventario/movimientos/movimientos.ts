import { Component, OnInit, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { InventarioService } from '../../../core/services/inventario.service';
import { MovimientoInventario } from '../../../core/models/inventario/movimientoInventario';
import { TipoMovimiento } from '../../../core/models/inventario/tipoMovimiento';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-movimientos',
  imports: [
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TagModule,
    FloatLabelModule,
    FormsModule,
    DatePipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.scss',
})
export class Movimientos implements OnInit {
  private readonly inventarioService = inject(InventarioService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly movimientos = signal<MovimientoInventario[]>([]);
  protected readonly tipoFiltro = signal<TipoMovimiento | ''>('');

  protected readonly tiposMovimiento = [
    { label: 'Entrada', value: 'ENTRADA' },
    { label: 'Salida', value: 'SALIDA' },
    { label: 'Ajuste', value: 'AJUSTE' }
  ];

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  private cargarMovimientos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.inventarioService.obtenerMovimientos().subscribe({
      next: (movimientos) => {
        this.movimientos.set(movimientos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
        this.error.set('No se pudieron cargar los movimientos.');
        this.loading.set(false);
      }
    });
  }

  protected onRetry(): void {
    this.cargarMovimientos();
  }

  protected getTipoSeverity(tipo: string): 'success' | 'warn' | 'info' {
    const severities: Record<string, 'success' | 'warn' | 'info'> = {
      'ENTRADA': 'success',
      'SALIDA': 'warn',
      'AJUSTE': 'info'
    };
    return severities[tipo] || 'info';
  }

  protected getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'ENTRADA': 'Entrada',
      'SALIDA': 'Salida',
      'AJUSTE': 'Ajuste'
    };
    return labels[tipo] || tipo;
  }

  protected getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'ENTRADA': 'pi-arrow-down',
      'SALIDA': 'pi-arrow-up',
      'AJUSTE': 'pi-sync'
    };
    return icons[tipo] || 'pi-question';
  }
}
