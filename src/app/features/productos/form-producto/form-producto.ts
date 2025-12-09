import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto';
import { CrearProductoDTO } from '../../../core/models/producto/crearProductoDTO';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-form-producto',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    SelectModule,
    DividerModule,
    FloatLabelModule,
    TextareaModule,
    ToastModule,
    Loading,
    ErrorMessage
  ],
  providers: [MessageService],
  templateUrl: './form-producto.html',
  styleUrl: './form-producto.scss',
})
export class FormProducto implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isEditMode = signal(false);
  protected readonly productoId = signal<number | null>(null);

  protected productoForm!: FormGroup;

  // Opciones para selects (estas deberían venir de servicios en producción)
  protected readonly categorias = signal([
    { id: 1, nombre: 'Pan' },
    { id: 2, nombre: 'Pasteles' },
    { id: 3, nombre: 'Galletas' }
  ]);

  protected readonly unidadesMedida = signal([
    { id: 1, nombre: 'Unidad' },
    { id: 2, nombre: 'Kilogramo' },
    { id: 3, nombre: 'Paquete' }
  ]);

  protected readonly estadosProducto = signal([
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Descontinuado', value: 'DESCONTINUADO' }
  ]);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.productoForm = this.fb.group({
      codigo: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      idCategoria: [null, Validators.required],
      idUnidad: [null, Validators.required],
      stockActual: [0, [Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      stockMaximo: [null, [Validators.min(0)]],
      requiereLote: [false],
      diasVidaUtil: [null, [Validators.min(1)]],
      imagenUrl: [''],
      precioBase: [0, [Validators.required, Validators.min(0)]],
      precioJM: [null, [Validators.min(0)]],
      precioCR: [null, [Validators.min(0)]],
      estado: ['ACTIVO', Validators.required]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.isEditMode.set(true);
      this.productoId.set(+id);
      this.cargarProducto(+id);
    }
  }

  private cargarProducto(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productoService.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.llenarFormulario(producto);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.error.set('No se pudo cargar el producto.');
        this.loading.set(false);
      }
    });
  }

  private llenarFormulario(producto: Producto): void {
    this.productoForm.patchValue({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      idCategoria: producto.idCategoria,
      idUnidad: producto.idUnidad,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      stockMaximo: producto.stockMaximo,
      requiereLote: producto.requiereLote,
      diasVidaUtil: producto.diasVidaUtil,
      imagenUrl: producto.imagenUrl,
      precioBase: producto.precioBase,
      precioJM: producto.precios['PRECIO_JM'] || null,
      precioCR: producto.precios['PRECIO_CR'] || null,
      estado: producto.estado
    });
  }

  protected onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa todos los campos requeridos' });
      return;
    }

    const formValue = this.productoForm.value;

    // Transform to backend format
    const productoDTO: any = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      idCategoria: formValue.idCategoria,
      idUnidad: formValue.idUnidad,
      stockMinimo: formValue.stockMinimo,
      stockMaximo: formValue.stockMaximo,
      requiereLote: formValue.requiereLote,
      diasVidaUtil: formValue.diasVidaUtil,
      imagenUrl: formValue.imagenUrl,
      estado: formValue.estado,
      precioBase: formValue.precioBase,
      preciosEspeciales: {}
    };

    // Add special prices if provided
    if (formValue.precioJM != null) {
      productoDTO.preciosEspeciales['PRECIO_JM'] = formValue.precioJM;
    }
    if (formValue.precioCR != null) {
      productoDTO.preciosEspeciales['PRECIO_CR'] = formValue.precioCR;
    }

    // Only include codigo for creation
    if (!this.isEditMode()) {
      productoDTO.codigo = formValue.codigo;
    }

    if (this.isEditMode() && this.productoId()) {
      this.actualizarProducto(this.productoId()!, productoDTO);
    } else {
      this.crearProducto(productoDTO);
    }
  }

  private crearProducto(producto: CrearProductoDTO): void {
    this.loading.set(true);

    this.productoService.crear(producto).subscribe({
      next: (productoCreado) => {
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado exitosamente' });
        setTimeout(() => {
          this.router.navigate(['/productos', productoCreado.idProducto]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el producto' });
      }
    });
  }

  private actualizarProducto(id: number, producto: CrearProductoDTO): void {
    this.loading.set(true);

    this.productoService.actualizar(id, producto).subscribe({
      next: (productoActualizado) => {
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado exitosamente' });
        setTimeout(() => {
          this.router.navigate(['/productos', productoActualizado.idProducto]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el producto' });
      }
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/productos']);
  }

  protected onRetry(): void {
    if (this.productoId()) {
      this.cargarProducto(this.productoId()!);
    }
  }
}
