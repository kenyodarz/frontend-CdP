import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
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
import { switchMap } from 'rxjs/operators';

import { ProductoService } from '../../../core/services/producto.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { DocumentoRecepcionService } from '../../../core/services/documento-recepcion.service';
import { Producto } from '../../../core/models/producto/producto';
import { Lote } from '../../../core/models/inventario/lote';
import { CrearLoteDTO } from '../../../core/models/inventario/crearLoteDTO';
import { CrearDocumentoRecepcionDTO, DetalleRecepcionDTO } from '../../../core/models/inventario/documento-recepcion';
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
  private readonly ref = inject(DynamicDialogRef);
  private readonly productoService = inject(ProductoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly documentoRecepcionService = inject(DocumentoRecepcionService);
  private readonly messageService = inject(MessageService);

  protected readonly documentoForm: FormGroup;
  protected readonly entradaForm: FormGroup;
  protected readonly loteForm: FormGroup;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly productosFiltrados = signal<Producto[]>([]);
  protected readonly productoSeleccionado = signal<Producto | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly lotesFiltrados = signal<Lote[]>([]);
  protected readonly mostrarLotes = signal(false);
  protected readonly mostrarFormLote = signal(false);
  protected readonly productosEntrada = signal<ProductoEntrada[]>([]);

  constructor() {
    // Formulario del documento (campos comunes)
    this.documentoForm = this.fb.group({
      fechaElaboracion: [new Date().toISOString().split('T')[0], Validators.required],
      motivo: ['Producción diaria', Validators.required],
      observaciones: ['']
    });

    // Formulario para agregar productos
    this.entradaForm = this.fb.group({
      producto: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      codigoLote: [null],
      observaciones: ['']
    });

    // Formulario para crear lote inline
    this.loteForm = this.fb.group({
      codigoLote: ['', Validators.required],
      fechaElaboracion: [new Date().toISOString().split('T')[0], Validators.required],
      fechaVencimiento: [null],
    });

    // Calcular fecha de vencimiento automáticamente cuando cambia fecha de elaboración
    this.loteForm.get('fechaElaboracion')?.valueChanges.subscribe(fechaElaboracion => {
      if (fechaElaboracion && this.productoSeleccionado()) {
        const producto = this.productoSeleccionado()!;

        // Calcular fecha de vencimiento
        const fechaVencimiento = this.calcularFechaVencimiento(
          fechaElaboracion,
          producto.diasVidaUtil
        );

        // Regenerar código de lote con la nueva fecha
        const codigoLote = this.generarCodigoLote(producto, fechaElaboracion);

        this.loteForm.patchValue({
          fechaVencimiento,
          codigoLote
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarLotes();
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

  protected filtrarLotes(event: any): void {
    const query = event.query.toLowerCase();
    const filtrados = this.lotes().filter(l =>
      l.codigoLote.toLowerCase().includes(query)
    );
    this.lotesFiltrados.set(filtrados);
  }

  protected onProductoSeleccionado(event: any): void {
    const producto = event.value as Producto;
    this.productoSeleccionado.set(producto);

    // Todos los productos requieren lote, siempre mostrar sección de lotes
    this.mostrarLotes.set(true);
    this.entradaForm.get('codigoLote')?.setValidators(Validators.required);
    this.entradaForm.get('codigoLote')?.updateValueAndValidity();
  }

  private cargarLotes(): void {
    // Cargar TODOS los lotes activos
    // Esto permite compartir lotes entre productos relacionados
    // Ej: Hamburguesa X10, X5, X6 pueden usar el mismo lote
    this.inventarioService.obtenerTodosLotes().subscribe({
      next: (lotes: Lote[]) => {
        // Filtrar solo lotes activos con cantidad disponible
        const lotesDisponibles = lotes.filter(l => l.estado === 'ACTIVO'
        );
        this.lotes.set(lotesDisponibles);
      },
      error: (err: any) => {
        console.error('Error al cargar lotes:', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los lotes disponibles'
        });
      }
    });
  }

  protected toggleFormLote(): void {
    this.mostrarFormLote.set(!this.mostrarFormLote());
    if (this.mostrarFormLote()) {
      // Crear nuevo lote - quitar validación de codigoLote del entradaForm
      this.entradaForm.get('codigoLote')?.clearValidators();
      this.entradaForm.get('codigoLote')?.updateValueAndValidity();

      const producto = this.productoSeleccionado();
      if (producto) {
        // Generar código de lote sugerido
        const fechaElaboracion = this.loteForm.value.fechaElaboracion;
        const codigoSugerido = this.generarCodigoLote(producto, fechaElaboracion);
        this.loteForm.patchValue({ codigoLote: codigoSugerido });
      }

      // Fecha de elaboración del documento
      const fechaElaboracion = this.documentoForm.value.fechaElaboracion;
      if (fechaElaboracion) {
        this.loteForm.patchValue({ fechaElaboracion: fechaElaboracion });
      }
    } else {
      // Usar lote existente - restaurar validación de codigoLote
      this.entradaForm.get('codigoLote')?.setValidators(Validators.required);
      this.entradaForm.get('codigoLote')?.updateValueAndValidity();
    }
  }

  /**
   * Genera código de lote siguiendo el formato:
   * CDP + [TipoProducto] + [3Consonantes] + [FechaInvertida] + [Unidad]
   * Ejemplo: CDPPHMB522150P (Pan Hamburguesa 05/12/25 invertido Paquete)
   * Fecha invertida: 051225 → 522150
   */
  private generarCodigoLote(producto: Producto, fechaElaboracion?: string): string {
    const prefijo = 'CDP';

    // Tipo de producto (primera letra de categoría o 'P' por defecto)
    const tipoProducto = this.obtenerTipoProducto(producto);

    // 3 primeras consonantes del nombre del producto
    const consonantes = this.extraerConsonantes(producto.nombre, 3);

    // Fecha invertida YYMMDD
    const fecha = fechaElaboracion || this.documentoForm.value.fechaElaboracion || new Date().toISOString().split('T')[0];
    const fechaInvertida = this.invertirFecha(fecha);

    // Unidad de medida (primera letra de abreviatura o 'U')
    const unidad = producto.abreviaturaUnidad?.charAt(0).toUpperCase() || 'U';

    // Formato: CDP + Tipo + Consonantes + Fecha + Unidad
    return `${prefijo}${tipoProducto}${consonantes}${fechaInvertida}${unidad}`;
  }

  /**
   * Obtiene el tipo de producto basado en la categoría
   * P: Pan, G: Galleta, etc.
   */
  private obtenerTipoProducto(producto: Producto): string {
    const categoria = producto.nombreCategoria?.toUpperCase() || '';

    // Mapeo de categorías a tipos
    if (categoria.includes('PAN')) return 'P';
    if (categoria.includes('GALLETA')) return 'G';
    if (categoria.includes('PASTEL')) return 'T';
    if (categoria.includes('TORTA')) return 'T';
    if (categoria.includes('POSTRE')) return 'D';

    // Por defecto, primera letra de la categoría
    return categoria.charAt(0) || 'P';
  }

  /**
   * Extrae las primeras N consonantes de un texto
   * Ejemplo: "Hamburguesa" → "HMB"
   */
  private extraerConsonantes(texto: string, cantidad: number): string {
    const consonantes = texto
      .toUpperCase()
      .replaceAll(/[AEIOUÁÉÍÓÚ\s]/g, '') // Eliminar vocales y espacios
      .replaceAll(/[^A-Z]/g, '');         // Solo letras

    return consonantes.substring(0, cantidad).padEnd(cantidad, 'X');
  }

  /**
   * Invierte fecha de YYYY-MM-DD a DDMMYY invertido
   * Ejemplo: "2025-12-05" → "051225" → "522150"
   */
  private invertirFecha(fecha: string): string {
    const partes = fecha.split('-');
    if (partes.length === 3) {
      const dia = partes[2];
      const mes = partes[1];
      const anio = partes[0].substring(2); // Últimos 2 dígitos del año
      const ddmmyy = `${dia}${mes}${anio}`;
      // Invertir el string literalmente
      return ddmmyy.split('').reverse().join('');
    }
    return '';
  }

  /**
   * Calcula la fecha de vencimiento basándose en la fecha de elaboración
   * y los días de vida útil del producto
   */
  private calcularFechaVencimiento(fechaElaboracion: string, diasVidaUtil?: number): string {
    if (!diasVidaUtil || diasVidaUtil <= 0) {
      return '';
    }

    const fecha = new Date(fechaElaboracion);
    fecha.setDate(fecha.getDate() + diasVidaUtil);

    return fecha.toISOString().split('T')[0];
  }


  protected agregarProducto(): void {
    console.log('agregarProducto() llamado');
    console.log('entradaForm valid:', this.entradaForm.valid);
    console.log('entradaForm value:', this.entradaForm.value);
    console.log('productoSeleccionado:', this.productoSeleccionado());

    if (this.entradaForm.invalid) {
      console.log('Formulario inválido');
      this.entradaForm.markAllAsTouched();
      return;
    }

    const producto = this.productoSeleccionado();
    if (!producto) {
      console.log('No hay producto seleccionado');
      return;
    }

    console.log('Producto requiere lote:', producto.requiereLote);

    // Todos los productos requieren lote
    if (!producto.requiereLote) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los productos deben tener configurado "requiere lote"'
      });
      return;
    }

    // Validar que haya lote (nuevo o existente)
    const crearNuevoLote = this.mostrarFormLote();
    const codigoLoteExistente = this.entradaForm.value.codigoLote;

    if (!crearNuevoLote && !codigoLoteExistente) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Lote requerido',
        detail: 'Debes seleccionar un lote existente o crear uno nuevo'
      });
      this.entradaForm.get('codigoLote')?.markAsTouched();
      return;
    }

    // Si va a crear lote nuevo, validar formulario
    if (crearNuevoLote) {
      if (this.loteForm.invalid) {
        this.loteForm.markAllAsTouched();
        this.messageService.add({
          severity: 'warn',
          summary: 'Formulario incompleto',
          detail: 'Completa todos los campos del lote'
        });
        return;
      }

      // Crear lote primero (llamada HTTP)
      this.loading.set(true);
      const nuevoLote: CrearLoteDTO = {
        codigoLote: this.loteForm.value.codigoLote,
        fechaElaboracion: this.loteForm.value.fechaElaboracion,
        fechaVencimiento: this.loteForm.value.fechaVencimiento
      };

      this.inventarioService.crearLote(nuevoLote).subscribe({
        next: (loteCreado: Lote) => {
          // Agregar producto con el lote creado
          const entrada: ProductoEntrada = {
            producto: producto,
            cantidad: this.entradaForm.value.cantidad,
            motivo: this.documentoForm.value.motivo,
            lote: loteCreado,
            crearNuevoLote: false // Ya fue creado
          };

          this.productosEntrada.update(productos => [...productos, entrada]);

          // Actualizar lista de lotes disponibles
          this.lotes.update(lotes => [...lotes, loteCreado]);

          this.messageService.add({
            severity: 'success',
            summary: 'Producto agregado',
            detail: `${producto.nombre} con lote ${loteCreado.codigoLote} agregado a la lista`
          });

          this.resetFormularioProducto();
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Error al crear lote:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al crear lote',
            detail: err.error?.message || 'No se pudo crear el lote'
          });
          this.loading.set(false);
        }
      });
    } else {
      // Usar lote existente
      // El autocomplete devuelve el objeto Lote completo
      const loteSeleccionado = codigoLoteExistente as Lote;

      if (!loteSeleccionado || !loteSeleccionado.codigoLote) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Lote seleccionado no encontrado'
        });
        return;
      }

      const entrada: ProductoEntrada = {
        producto: producto,
        cantidad: this.entradaForm.value.cantidad,
        motivo: this.documentoForm.value.motivo,
        lote: loteSeleccionado,
        crearNuevoLote: false
      };

      this.productosEntrada.update(productos => [...productos, entrada]);

      this.messageService.add({
        severity: 'success',
        summary: 'Producto agregado',
        detail: `${producto.nombre} agregado a la lista`
      });

      this.resetFormularioProducto();
    }
  }

  protected eliminarProducto(index: number): void {
    this.productosEntrada.update(productos =>
      productos.filter((_, i) => i !== index)
    );
  }

  protected registrarDocumento(): void {
    const productos = this.productosEntrada();
    if (productos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Lista vacía',
        detail: 'Agrega al menos un producto para registrar'
      });
      return;
    }

    if (this.documentoForm.invalid) {
      this.documentoForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // Crear detalles del documento
    const detalles: DetalleRecepcionDTO[] = productos.map(entrada => ({
      idProducto: entrada.producto.idProducto!,
      cantidad: entrada.cantidad,
      codigoLote: entrada.lote?.codigoLote,
      observaciones: entrada.producto.nombre
    }));

    // Crear DTO del documento
    const documentoDTO: CrearDocumentoRecepcionDTO = {
      fechaElaboracion: this.documentoForm.value.fechaElaboracion,
      motivo: this.documentoForm.value.motivo,
      observaciones: this.documentoForm.value.observaciones,
      detalles: detalles
    };

    // Crear y confirmar documento
    this.documentoRecepcionService.crear(documentoDTO).pipe(
      switchMap(documento => {
        // Confirmar el documento para aplicar al inventario
        return this.documentoRecepcionService.confirmar(documento.id!);
      })
    ).subscribe({
      next: (documentoConfirmado) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Documento registrado',
          detail: `Documento ${documentoConfirmado.numeroDocumento} con ${documentoConfirmado.totalProductos} producto(s) registrado correctamente`
        });

        // Cerrar dialog con resultado exitoso
        this.ref.close({
          success: true,
          documento: documentoConfirmado
        });
      },
      error: (err: any) => {
        console.error('Error al registrar documento:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Ocurrió un error al registrar el documento'
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
    this.ref.close(null);
  }
}
