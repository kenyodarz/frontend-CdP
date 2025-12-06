import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto';

@Component({
  selector: 'app-existencias',
  imports: [
    CommonModule,
    TableModule,
    ButtonDirective
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

  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 50) return 'success';
    if (stock > 10) return 'warn';
    return 'danger';
  }
}
