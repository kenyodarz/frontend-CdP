import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';

import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CrearLoteDTO } from '../../../core/models/inventario/crearLoteDTO';
import { Producto } from '../../../core/models/producto/producto';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-crear-lote',
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    FloatLabelModule,
    InputNumberModule,
    Loading
  ],
  templateUrl: './crear-lote.html',
  styleUrl: './crear-lote.scss',
})
export class CrearLote implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventarioService = inject(InventarioService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly productos = signal<Producto[]>([]);
  protected loteForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.cargarProductos();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.loteForm = this.fb.group({
      idProducto: [null, Validators.required],
      codigoLote: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      fechaElaboracion: [new Date(), Validators.required],
      fechaVencimiento: [null],
      observaciones: ['']
    });
  }

  private cargarProductos(): void {
    this.productoService.obtenerTodos(0, 1000).subscribe({
      next: (page) => {
        this.productos.set(page.content);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  private setupFormListeners(): void {
    // Generar código de lote cuando cambia el producto o la fecha
    this.loteForm.get('idProducto')?.valueChanges.subscribe(() => {
      this.generarYAsignarCodigoLote();
      this.calcularFechaVencimientoAutomatica();
    });

    this.loteForm.get('fechaElaboracion')?.valueChanges.subscribe(() => {
      this.generarYAsignarCodigoLote();
      this.calcularFechaVencimientoAutomatica();
    });
  }

  private generarYAsignarCodigoLote(): void {
    const idProducto = this.loteForm.get('idProducto')?.value;
    const fechaElaboracion = this.loteForm.get('fechaElaboracion')?.value;

    if (idProducto && fechaElaboracion) {
      const producto = this.productos().find(p => p.idProducto === idProducto);
      if (producto) {
        const codigo = this.generarCodigoLote(producto, this.formatDate(fechaElaboracion));
        this.loteForm.patchValue({ codigoLote: codigo }, { emitEvent: false });
      }
    }
  }

  private calcularFechaVencimientoAutomatica(): void {
    const idProducto = this.loteForm.get('idProducto')?.value;
    const fechaElaboracion = this.loteForm.get('fechaElaboracion')?.value;

    if (idProducto && fechaElaboracion) {
      const producto = this.productos().find(p => p.idProducto === idProducto);
      if (producto?.diasVidaUtil) {
        const fechaVencimiento = new Date(fechaElaboracion);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + producto.diasVidaUtil);
        this.loteForm.patchValue({ fechaVencimiento }, { emitEvent: false });
      }
    }
  }

  private generarCodigoLote(producto: Producto, fechaElaboracion: string): string {
    const prefijo = 'CDP';

    // Tipo de producto (primera letra de categoría o 'P' por defecto)
    const tipoProducto = this.obtenerTipoProducto(producto);

    // 3 primeras consonantes del nombre del producto
    const consonantes = this.extraerConsonantes(producto.nombre, 3);

    // Fecha invertida YYMMDD
    const fechaInvertida = this.invertirFecha(fechaElaboracion);

    // Unidad de medida (primera letra de abreviatura o 'U')
    const unidad = producto.abreviaturaUnidad?.charAt(0).toUpperCase() || 'U';

    // Formato: CDP + Tipo + Consonantes + Fecha + Unidad
    return `${prefijo}${tipoProducto}${consonantes}${fechaInvertida}${unidad}`;
  }

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

  private extraerConsonantes(texto: string, cantidad: number): string {
    const consonantes = texto
      .toUpperCase()
      .replaceAll(/[AEIOUÁÉÍÓÚ\s]/g, '') // Eliminar vocales y espacios
      .replaceAll(/[^A-Z]/g, '');         // Solo letras

    return consonantes.substring(0, cantidad).padEnd(cantidad, 'X');
  }

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

  protected onSubmit(): void {
    if (this.loteForm.invalid) {
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
      Object.keys(this.loteForm.controls).forEach(key => {
        this.loteForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.loteForm.value;
    const loteDTO: CrearLoteDTO = {
      codigoLote: formValue.codigoLote,
      fechaElaboracion: this.formatDate(formValue.fechaElaboracion),
      fechaVencimiento: formValue.fechaVencimiento ? this.formatDate(formValue.fechaVencimiento) : undefined,
      observaciones: formValue.observaciones
    };

    this.loading.set(true);

    this.inventarioService.crearLote(loteDTO).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success('Lote creado exitosamente');
        this.router.navigate(['/inventario/lotes']);
      },
      error: (err) => {
        console.error('Error al crear lote:', err);
        this.loading.set(false);
        this.notificationService.error('Error al crear el lote');
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  protected cancelar(): void {
    this.router.navigate(['/inventario/lotes']);
  }

  protected getProductoNombre(idProducto: number): string {
    const producto = this.productos().find(p => p.idProducto === idProducto);
    return producto ? producto.nombre : '';
  }

  protected getProductoInfo(idProducto: number): string {
    const producto = this.productos().find(p => p.idProducto === idProducto);
    if (!producto) return '';

    const info = [];
    if (producto.nombreCategoria) info.push(`Categoría: ${producto.nombreCategoria}`);
    if (producto.diasVidaUtil) info.push(`Vida útil: ${producto.diasVidaUtil} días`);
    if (producto.abreviaturaUnidad) info.push(`Unidad: ${producto.abreviaturaUnidad}`);

    return info.join(' | ');
  }
}
