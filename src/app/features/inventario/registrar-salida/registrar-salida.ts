import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgClass } from '@angular/common';

import { ProductoService } from '../../../core/services/producto.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { Producto } from '../../../core/models/producto/producto';
import { Lote } from '../../../core/models/inventario/lote';
import { RegistrarSalidaDTO } from '../../../core/models/inventario/registrarSalidaDTO';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-registrar-salida',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    AutoCompleteModule,
    SelectModule,
    MessageModule,
    ToastModule,
    NgClass,
    Loading,
    ErrorMessage
  ],
  providers: [MessageService],
  templateUrl: './registrar-salida.html',
  styleUrl: './registrar-salida.scss',
})
export class RegistrarSalida implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly productoService = inject(ProductoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly messageService = inject(MessageService);

  protected readonly salidaForm: FormGroup;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly productosFiltrados = signal<Producto[]>([]);
  protected readonly productoSeleccionado = signal<Producto | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly mostrarLotes = signal(false);

  constructor() {
    this.salidaForm = this.fb.group({
      producto: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required],
      codigoLote: [null]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  protected cargarProductos(): void {
    this.loading.set(true);
    this.productoService.listarProductos().subscribe({
      next: (productos: Producto[]) => {
        // Filtrar solo productos con stock disponible
        const productosConStock = productos.filter((p: Producto) => (p.stockActual || 0) > 0);
        this.productos.set(productosConStock);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar productos:', err);
        this.error.set('No se pudieron cargar los productos.');
        this.loading.set(false);
      }
    });
  }

  protected filtrarProductos(event: any): void {
    const query = event.query.toLowerCase();
    const filtrados = this.productos().filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      (p.codigo?.toLowerCase() || '').includes(query)
    );
    this.productosFiltrados.set(filtrados);
  }

  protected onProductoSeleccionado(event: any): void {
    const producto = event.value as Producto;
    this.productoSeleccionado.set(producto);

    // Actualizar validador de cantidad máxima
    this.salidaForm.get('cantidad')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(producto.stockActual || 0)
    ]);
    this.salidaForm.get('cantidad')?.updateValueAndValidity();

    // Si el producto requiere lote, cargar los lotes disponibles
    if (producto.requiereLote && producto.idProducto) {
      this.cargarLotesProducto(producto.idProducto);
      this.mostrarLotes.set(true);
      this.salidaForm.get('codigoLote')?.setValidators(Validators.required);
    } else {
      this.mostrarLotes.set(false);
      this.lotes.set([]);
      this.salidaForm.get('codigoLote')?.clearValidators();
    }
    this.salidaForm.get('codigoLote')?.updateValueAndValidity();
  }

  private cargarLotesProducto(idProducto: number): void {
    this.inventarioService.obtenerLotesPorProducto(idProducto).subscribe({
      next: (lotes: Lote[]) => {
        // Filtrar solo lotes activos
        const lotesDisponibles = lotes.filter(l => l.estado === 'ACTIVO');
        this.lotes.set(lotesDisponibles);
      },
      error: (err: any) => {
        console.error('Error al cargar lotes:', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los lotes del producto'
        });
      }
    });
  }

  protected onSubmit(): void {
    if (this.salidaForm.invalid) {
      this.salidaForm.markAllAsTouched();
      return;
    }

    const producto = this.productoSeleccionado();
    if (!producto) {
      return;
    }

    const cantidad = this.salidaForm.value.cantidad;

    // Validación adicional de stock
    if (cantidad > (producto.stockActual || 0)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Stock insuficiente. Disponible: ${producto.stockActual}`
      });
      return;
    }

    const salida: RegistrarSalidaDTO = {
      idProducto: producto.idProducto!,
      cantidad: cantidad,
      motivo: this.salidaForm.value.motivo,
      codigoLote: this.salidaForm.value.codigoLote
    };

    this.loading.set(true);
    this.inventarioService.registrarSalida(salida).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Salida registrada correctamente'
        });
        this.resetForm();
        this.loading.set(false);

        // Recargar productos para actualizar stocks
        this.cargarProductos();
      },
      error: (err: any) => {
        console.error('Error al registrar salida:', err);
        const errorMsg = err.error?.message || 'No se pudo registrar la salida';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg
        });
        this.loading.set(false);
      }
    });
  }

  protected resetForm(): void {
    this.salidaForm.reset();
    this.productoSeleccionado.set(null);
    this.mostrarLotes.set(false);
    this.lotes.set([]);
  }

  protected onCancel(): void {
    this.router.navigate(['/inventario/movimientos']);
  }

  protected getProductoDisplay(producto: Producto): string {
    return producto ? `${producto.codigo} - ${producto.nombre}` : '';
  }

  protected getLoteDisplay(lote: Lote): string {
    return lote.codigoLote;
  }

  protected getStockClass(): string {
    const producto = this.productoSeleccionado();
    if (!producto) return '';

    const stock = producto.stockActual || 0;
    const minimo = producto.stockMinimo || 0;

    if (stock === 0) return 'stock-agotado';
    if (stock <= minimo) return 'stock-bajo';
    return 'stock-normal';
  }
}
