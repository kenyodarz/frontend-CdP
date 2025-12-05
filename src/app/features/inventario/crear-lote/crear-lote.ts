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
import { ProductoSimple } from '../../../core/models/producto/productoSimple';
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
  protected readonly productos = signal<ProductoSimple[]>([]);
  protected loteForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.cargarProductos();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.loteForm = this.fb.group({
      codigoLote: ['', Validators.required],
      fechaElaboracion: [new Date(), Validators.required],
      fechaVencimiento: [null],
      observaciones: ['']
    });
  }

  private cargarProductos(): void {
    // Solicitar una página grande para obtener todos los productos para el selector
    this.productoService.obtenerTodos(0, 1000).subscribe({
      next: (page) => {
        // Mapear Producto[] a ProductoSimple[]
        const productosSimple: ProductoSimple[] = page.content.map(p => ({
          idProducto: p.idProducto,
          codigo: p.codigo,
          nombre: p.nombre,
          stockActual: p.stockActual,
          stockMinimo: p.stockMinimo,
          precioBase: p.precioBase,
          categoria: p.nombreCategoria || '',
          unidad: p.abreviaturaUnidad || '',
          stockBajo: p.stockActual <= p.stockMinimo,
          diasVidaUtil: p.diasVidaUtil,
          estado: p.estado
        }));
        this.productos.set(productosSimple);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  private setupFormListeners(): void {
    // Ya no se calcula automáticamente - el usuario debe ingresar las fechas manualmente
  }

  private calcularFechaVencimiento(fechaElaboracion: Date, diasVidaUtil: number): void {
    const fechaVencimiento = new Date(fechaElaboracion);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVidaUtil);
    this.loteForm.patchValue({ fechaVencimiento }, { emitEvent: false });
  }

  protected onSubmit(): void {
    if (this.loteForm.invalid) {
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
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
}
