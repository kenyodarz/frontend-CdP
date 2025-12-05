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

import { ProductoService } from '../../../core/services/producto.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { Producto } from '../../../core/models/producto/producto';
import { Lote } from '../../../core/models/inventario/lote';
import { RegistrarEntradaDTO } from '../../../core/models/inventario/registrarEntradaDTO';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-registrar-entrada',
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
    Loading,
    ErrorMessage
  ],
  providers: [MessageService],
  templateUrl: './registrar-entrada.html',
  styleUrl: './registrar-entrada.scss',
})
export class RegistrarEntrada implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly productoService = inject(ProductoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly messageService = inject(MessageService);

  protected readonly entradaForm: FormGroup;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly productosFiltrados = signal<Producto[]>([]);
  protected readonly productoSeleccionado = signal<Producto | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly mostrarLotes = signal(false);

  constructor() {
    this.entradaForm = this.fb.group({
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
        this.productos.set(productos);
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

    // Si el producto requiere lote, cargar los lotes disponibles
    if (producto.requiereLote && producto.idProducto) {
      this.cargarLotesProducto(producto.idProducto);
      this.mostrarLotes.set(true);
      this.entradaForm.get('codigoLote')?.setValidators(Validators.required);
    } else {
      this.mostrarLotes.set(false);
      this.lotes.set([]);
      this.entradaForm.get('codigoLote')?.clearValidators();
    }
    this.entradaForm.get('codigoLote')?.updateValueAndValidity();
  }

  private cargarLotesProducto(idProducto: number): void {
    this.inventarioService.obtenerLotesPorProducto(idProducto).subscribe({
      next: (lotes: Lote[]) => {
        // Filtrar solo lotes activos con cantidad disponible
        const lotesDisponibles = lotes.filter(l =>
          l.estado === 'ACTIVO' && l.cantidadActual > 0
        );
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
    if (this.entradaForm.invalid) {
      this.entradaForm.markAllAsTouched();
      return;
    }

    const producto = this.productoSeleccionado();
    if (!producto) {
      return;
    }

    const entrada: RegistrarEntradaDTO = {
      idProducto: producto.idProducto!,
      cantidad: this.entradaForm.value.cantidad,
      motivo: this.entradaForm.value.motivo,
      codigoLote: this.entradaForm.value.codigoLote
    };

    this.loading.set(true);
    this.inventarioService.registrarEntrada(entrada).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Entrada registrada correctamente'
        });
        this.resetForm();
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al registrar entrada:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar la entrada'
        });
        this.loading.set(false);
      }
    });
  }

  protected resetForm(): void {
    this.entradaForm.reset();
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
    return `${lote.codigoLote} (Disponible: ${lote.cantidadActual})`;
  }
}
