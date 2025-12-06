import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto';

@Component({
  selector: 'app-existencias',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonDirective,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    Tag
  ],
  templateUrl: './existencias.html',
  styleUrl: './existencias.scss',
  standalone: true
})
export class Existencias implements OnInit {
  private productoService = inject(ProductoService);
  private messageService = inject(MessageService);

  productos = signal<Producto[]>([]);
  loading = signal(false);
  searchValue = signal('');

  ngOnInit(): void {
    this.cargarExistencias();
  }

  cargarExistencias(): void {
    this.loading.set(true);

    this.productoService.listarExistencias().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar existencias:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las existencias'
        });
        this.loading.set(false);
      }
    });
  }

  getStockSeverity(producto: Producto): 'success' | 'warn' | 'danger' {
    if (producto.stockActual > producto.stockMinimo * 2) return 'success';
    if (producto.stockActual > producto.stockMinimo) return 'warn';
    return 'danger';
  }

  getStockLabel(producto: Producto): string {
    if (producto.stockActual > producto.stockMinimo * 2) return 'Stock Alto';
    if (producto.stockActual > producto.stockMinimo) return 'Stock Bajo';
    return 'Stock Crítico';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  onGlobalFilter(table: any, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    table.filterGlobal(value, 'contains');
  }

  clearFilter(table: any): void {
    this.searchValue.set('');
    table.clear();
  }

  exportExcel(): void {
    // Implementar exportación a Excel si es necesario
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Funcionalidad de exportación próximamente'
    });
  }
}
