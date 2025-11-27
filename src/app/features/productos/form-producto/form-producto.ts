import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto';
import { CrearProductoDTO } from '../../../core/models/producto/crearProductoDTO';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-form-producto',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule,
    Loading,
    ErrorMessage
  ],
  templateUrl: './form-producto.html',
  styleUrl: './form-producto.scss',
})
export class FormProducto implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

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

  protected readonly tiposTarifa = [
    { value: 'CERO_DIAS', label: '0 Días' },
    { value: 'OCHO_DIAS', label: '8 Días' },
    { value: 'QUINCE_DIAS', label: '15 Días' },
    { value: 'TREINTA_DIAS', label: '30 Días' }
  ];

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
      precios: this.fb.array([])
    });

    // Agregar precios por defecto para cada tipo de tarifa
    this.tiposTarifa.forEach(tipo => {
      this.agregarPrecio(tipo.value);
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
      idCategoria: producto.categoria.idCategoria,
      idUnidad: producto.unidadMedida.idUnidad,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      stockMaximo: producto.stockMaximo,
      requiereLote: producto.requiereLote,
      diasVidaUtil: producto.diasVidaUtil,
      imagenUrl: producto.imagenUrl
    });

    // Actualizar precios
    this.precios.clear();
    producto.precios.forEach(precio => {
      this.precios.push(this.fb.group({
        tipoTarifa: [precio.tipoTarifa],
        precio: [precio.precio, [Validators.required, Validators.min(0)]]
      }));
    });
  }

  get precios(): FormArray {
    return this.productoForm.get('precios') as FormArray;
  }

  private agregarPrecio(tipoTarifa: string): void {
    this.precios.push(this.fb.group({
      tipoTarifa: [tipoTarifa],
      precio: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  protected onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const productoDTO: CrearProductoDTO = this.productoForm.value;

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
        this.snackBar.open('Producto creado exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/productos', productoCreado.idProducto]);
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.loading.set(false);
        this.snackBar.open('Error al crear el producto', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private actualizarProducto(id: number, producto: CrearProductoDTO): void {
    this.loading.set(true);

    this.productoService.actualizar(id, producto).subscribe({
      next: (productoActualizado) => {
        this.loading.set(false);
        this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/productos', productoActualizado.idProducto]);
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.loading.set(false);
        this.snackBar.open('Error al actualizar el producto', 'Cerrar', {
          duration: 3000
        });
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

  protected getTarifaLabel(tipoTarifa: string): string {
    const tipo = this.tiposTarifa.find(t => t.value === tipoTarifa);
    return tipo?.label || tipoTarifa;
  }
}
