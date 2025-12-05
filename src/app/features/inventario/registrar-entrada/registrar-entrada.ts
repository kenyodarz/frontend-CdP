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
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ProductoService } from '../../../core/services/producto.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { Producto } from '../../../core/models/producto/producto';
import { Lote } from '../../../core/models/inventario/lote';
import { RegistrarEntradaDTO } from '../../../core/models/inventario/registrarEntradaDTO';
import { CrearLoteDTO } from '../../../core/models/inventario/crearLoteDTO';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

interface ProductoEntrada {
  producto: Producto;
  cantidad: number;
  motivo: string;
  lote?: Lote;
  crearNuevoLote?: boolean;
  nuevoLote?: CrearLoteDTO;
}

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
    TableModule,
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
  protected readonly loteForm: FormGroup;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly productosFiltrados = signal<Producto[]>([]);
  protected readonly productoSeleccionado = signal<Producto | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly mostrarLotes = signal(false);
  protected readonly mostrarFormLote = signal(false);
  protected readonly productosEntrada = signal<ProductoEntrada[]>([]);

  constructor() {
    this.entradaForm = this.fb.group({
      producto: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required],
      codigoLote: [null]
    });

    this.loteForm = this.fb.group({
      codigoLote: ['', Validators.required],
      fechaElaboracion: [new Date().toISOString().split('T')[0], Validators.required],
      fechaVencimiento: [null],
      cantidad: [null, [Validators.required, Validators.min(1)]]
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
      this.mostrarFormLote.set(false);
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

  protected toggleFormLote(): void {
    this.mostrarFormLote.set(!this.mostrarFormLote());
    if (this.mostrarFormLote()) {
      // Pre-llenar cantidad del lote con la cantidad del formulario
      const cantidadEntrada = this.entradaForm.value.cantidad;
      if (cantidadEntrada) {
        this.loteForm.patchValue({ cantidad: cantidadEntrada });
      }
      // Fecha de elaboración por defecto es hoy
      this.loteForm.patchValue({ fechaElaboracion: new Date().toISOString().split('T')[0] });
    }
  }

  protected agregarProducto(): void {
    if (this.entradaForm.invalid) {
      this.entradaForm.markAllAsTouched();
      return;
    }

    const producto = this.productoSeleccionado();
    if (!producto) {
      return;
    }

    const entrada: ProductoEntrada = {
      producto: producto,
      cantidad: this.entradaForm.value.cantidad,
      motivo: this.entradaForm.value.motivo,
      crearNuevoLote: this.mostrarFormLote()
    };

    // Si requiere lote y se va a crear uno nuevo
    if (producto.requiereLote && this.mostrarFormLote()) {
      if (this.loteForm.invalid) {
        this.loteForm.markAllAsTouched();
        return;
      }

      entrada.nuevoLote = {
        idProducto: producto.idProducto!,
        codigoLote: this.loteForm.value.codigoLote,
        fechaElaboracion: this.loteForm.value.fechaElaboracion,
        cantidad: this.loteForm.value.cantidad,
        fechaVencimiento: this.loteForm.value.fechaVencimiento
      };
    } else if (producto.requiereLote) {
      // Usar lote existente
      const loteSeleccionado = this.lotes().find(
        l => l.codigoLote === this.entradaForm.value.codigoLote
      );
      entrada.lote = loteSeleccionado;
    }

    // Agregar a la lista
    this.productosEntrada.update(productos => [...productos, entrada]);

    // Limpiar formularios
    this.resetFormularioProducto();

    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: `${producto.nombre} agregado a la lista`
    });
  }

  protected eliminarProducto(index: number): void {
    this.productosEntrada.update(productos =>
      productos.filter((_, i) => i !== index)
    );
  }

  protected registrarTodas(): void {
    const productos = this.productosEntrada();
    if (productos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Lista vacía',
        detail: 'Agrega al menos un producto para registrar'
      });
      return;
    }

    this.loading.set(true);

    // Crear observables para cada entrada
    const registros$ = productos.map(entrada => {
      // Si necesita crear lote primero
      if (entrada.crearNuevoLote && entrada.nuevoLote) {
        return this.inventarioService.crearLote(entrada.nuevoLote).pipe(
          // Después de crear el lote, registrar la entrada
          switchMap((loteCreado: Lote) => {
            const dto: RegistrarEntradaDTO = {
              idProducto: entrada.producto.idProducto!,
              cantidad: entrada.cantidad,
              motivo: entrada.motivo,
              codigoLote: loteCreado.codigoLote
            };
            return this.inventarioService.registrarEntrada(dto);
          })
        );
      } else {
        // Registrar entrada directamente
        const dto: RegistrarEntradaDTO = {
          idProducto: entrada.producto.idProducto!,
          cantidad: entrada.cantidad,
          motivo: entrada.motivo,
          codigoLote: entrada.lote?.codigoLote
        };
        return this.inventarioService.registrarEntrada(dto);
      }
    });

    // Ejecutar todas las llamadas en paralelo
    forkJoin(registros$).subscribe({
      next: (resultados) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${resultados.length} entrada(s) registrada(s) correctamente`
        });
        this.productosEntrada.set([]);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al registrar entradas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al registrar algunas entradas'
        });
        this.loading.set(false);
      }
    });
  }

  private resetFormularioProducto(): void {
    this.entradaForm.reset();
    this.loteForm.reset();
    this.productoSeleccionado.set(null);
    this.mostrarLotes.set(false);
    this.mostrarFormLote.set(false);
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
