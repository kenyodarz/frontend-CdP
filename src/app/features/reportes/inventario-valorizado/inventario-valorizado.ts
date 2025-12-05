import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { ReporteService } from '../../../core/services/reporte.service';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

interface ProductoValorizado {
  idProducto: number;
  codigo: string;
  nombre: string;
  stockActual: number;
  precioPromedio: number;
  valorTotal: number;
}

@Component({
  selector: 'app-inventario-valorizado',
  imports: [
    CardModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CurrencyPipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './inventario-valorizado.html',
  styleUrl: './inventario-valorizado.scss',
})
export class InventarioValorizado implements OnInit {
  private readonly reporteService = inject(ReporteService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<ProductoValorizado[]>([]);

  protected readonly totalValorizado = computed(() => {
    return this.productos().reduce((sum, p) => sum + p.valorTotal, 0);
  });

  protected readonly totalProductos = computed(() => {
    return this.productos().length;
  });

  protected readonly totalUnidades = computed(() => {
    return this.productos().reduce((sum, p) => sum + p.stockActual, 0);
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reporteService.inventarioValorizado().subscribe({
      next: (data: any) => {
        // Convertir datos del servicio al formato esperado
        const productosValorizados: ProductoValorizado[] = data.productos || [];
        this.productos.set(productosValorizados);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar inventario valorizado:', err);
        this.error.set('No se pudo cargar el inventario valorizado.');
        this.loading.set(false);
      }
    });
  }

  protected exportar(): void {
    // TODO: Implementar exportación a Excel
    console.log('Exportar inventario:', this.productos());
  }

  protected onRetry(): void {
    this.cargarDatos();
  }
}
