import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CrearLoteDTO } from '../../../core/models/inventario/crearLoteDTO';
import { ProductoSimple } from '../../../core/models/producto/productoSimple';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-crear-lote',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
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
  private readonly snackBar = inject(MatSnackBar);

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
      idProducto: [null, Validators.required],
      codigoLote: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      fechaElaboracion: [new Date(), Validators.required],
      fechaVencimiento: [null]
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
          categoria: p.categoria.nombre,
          unidad: p.unidadMedida.abreviatura,
          stockBajo: p.stockBajo,
          diasVidaUtil: p.diasVidaUtil,
          estado: p.estado
        }));
        this.productos.set(productosSimple);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  private setupFormListeners(): void {
    // Calcular fecha de vencimiento automáticamente
    this.loteForm.get('idProducto')?.valueChanges.subscribe(idProducto => {
      if (idProducto) {
        const producto = this.productos().find(p => p.idProducto === idProducto);
        if (producto && producto.diasVidaUtil && producto.diasVidaUtil > 0) {
          const fechaElaboracion = this.loteForm.get('fechaElaboracion')?.value;
          if (fechaElaboracion) {
            this.calcularFechaVencimiento(fechaElaboracion, producto.diasVidaUtil);
          }
        }
      }
    });

    this.loteForm.get('fechaElaboracion')?.valueChanges.subscribe(fechaElaboracion => {
      const idProducto = this.loteForm.get('idProducto')?.value;
      if (idProducto && fechaElaboracion) {
        const producto = this.productos().find(p => p.idProducto === idProducto);
        if (producto && producto.diasVidaUtil && producto.diasVidaUtil > 0) {
          this.calcularFechaVencimiento(fechaElaboracion, producto.diasVidaUtil);
        }
      }
    });
  }

  private calcularFechaVencimiento(fechaElaboracion: Date, diasVidaUtil: number): void {
    const fechaVencimiento = new Date(fechaElaboracion);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVidaUtil);
    this.loteForm.patchValue({ fechaVencimiento }, { emitEvent: false });
  }

  protected onSubmit(): void {
    if (this.loteForm.invalid) {
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const formValue = this.loteForm.value;
    const loteDTO: CrearLoteDTO = {
      idProducto: formValue.idProducto,
      codigoLote: formValue.codigoLote,
      cantidad: formValue.cantidad,
      fechaElaboracion: this.formatDate(formValue.fechaElaboracion),
      fechaVencimiento: formValue.fechaVencimiento ? this.formatDate(formValue.fechaVencimiento) : undefined
    };

    this.loading.set(true);

    this.inventarioService.crearLote(loteDTO).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Lote creado exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/inventario/lotes']);
      },
      error: (err) => {
        console.error('Error al crear lote:', err);
        this.loading.set(false);
        this.snackBar.open('Error al crear el lote', 'Cerrar', { duration: 3000 });
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
