import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {Divider, DividerModule} from 'primeng/divider';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto';

@Component({
  selector: 'app-recalcular-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    AutoCompleteModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    Divider
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './recalcular-stock.html',
  styleUrl: './recalcular-stock.css'
})
export class RecalcularStockComponent {
  private readonly inventarioService = inject(InventarioService);
  private readonly productoService = inject(ProductoService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  productoSeleccionado: Producto | null = null;
  productosFiltrados: Producto[] = [];
  recalculando = false;
  recalculandoTodos = false;

  buscarProductos(event: any): void {
    const query = event.query.toLowerCase();
    // Use listarProductos and filter locally since buscarPorNombre returns ProductoSimple
    this.productoService.listarProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productosFiltrados = productos.filter((p: Producto) =>
          p.nombre.toLowerCase().includes(query)
        );
      },
      error: (error: any) => {
        console.error('Error buscando productos:', error);
      }
    });
  }

  recalcularProducto(): void {
    if (!this.productoSeleccionado?.idProducto) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un producto'
      });
      return;
    }

    this.recalculando = true;
    const idProducto = this.productoSeleccionado.idProducto;

    this.inventarioService.recalcularStockProducto(idProducto).subscribe({
      next: (producto) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Stock Recalculado',
          detail: `Stock actualizado: ${producto.stockActual} unidades`
        });
        this.productoSeleccionado = producto;
        this.recalculando = false;
      },
      error: (error: any) => {
        console.error('Error recalculando stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo recalcular el stock'
        });
        this.recalculando = false;
      }
    });
  }

  confirmarRecalcularTodos(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de recalcular el stock de TODOS los productos? Esta operación puede tomar varios minutos.',
      header: 'Confirmar Recálculo Masivo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Recalcular Todo',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.recalcularTodos();
      }
    });
  }

  private recalcularTodos(): void {
    this.recalculandoTodos = true;

    this.inventarioService.recalcularStockTodos().subscribe({
      next: (mensaje) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Recálculo Completado',
          detail: mensaje
        });
        this.recalculandoTodos = false;
      },
      error: (error: any) => {
        console.error('Error recalculando todos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo completar el recálculo masivo'
        });
        this.recalculandoTodos = false;
      }
    });
  }
}
