import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';

import { OrdenService } from '../../../core/services/orden.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CrearOrdenDTO } from '../../../core/models/orden/crearOrdenDTO';
import { ClienteSimple } from '../../../core/models/cliente/clienteSimple';
import { ProductoSimple } from '../../../core/models/producto/productoSimple';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

interface ProductoOrden {
  idProducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-crear-orden',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatTableModule,
    CurrencyPipe,
    Loading,
    ErrorMessage
  ],
  templateUrl: './crear-orden.html',
  styleUrl: './crear-orden.scss',
})
export class CrearOrden implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ordenService = inject(OrdenService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly clientes = signal<ClienteSimple[]>([]);
  protected readonly productos = signal<ProductoSimple[]>([]);
  protected readonly productosOrden = signal<ProductoOrden[]>([]);

  protected ordenForm!: FormGroup;
  protected readonly displayedColumns = ['nombre', 'precio', 'cantidad', 'subtotal', 'acciones'];

  protected readonly totalOrden = computed(() => {
    return this.productosOrden().reduce((sum, p) => sum + p.subtotal, 0);
  });

  ngOnInit(): void {
    this.initForm();
    this.cargarClientes();
    this.cargarProductos();
  }

  private initForm(): void {
    this.ordenForm = this.fb.group({
      idCliente: [null, Validators.required],
      observaciones: ['']
    });
  }

  private cargarClientes(): void {
    this.clienteService.obtenerTodos().subscribe({
      next: (clientes) => this.clientes.set(clientes),
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  private cargarProductos(): void {
    this.productoService.obtenerTodos().subscribe({
      next: (productos) => this.productos.set(productos),
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  protected agregarProducto(producto: ProductoSimple, cantidad: number): void {
    if (cantidad <= 0) return;

    const productosActuales = this.productosOrden();
    const existente = productosActuales.find(p => p.idProducto === producto.idProducto);

    if (existente) {
      const actualizados = productosActuales.map(p =>
        p.idProducto === producto.idProducto
          ? { ...p, cantidad: p.cantidad + cantidad, subtotal: (p.cantidad + cantidad) * p.precio }
          : p
      );
      this.productosOrden.set(actualizados);
    } else {
      this.productosOrden.set([
        ...productosActuales,
        {
          idProducto: producto.idProducto!,
          nombre: producto.nombre,
          precio: producto.precio0D,
          cantidad,
          subtotal: producto.precio0D * cantidad
        }
      ]);
    }
  }

  protected eliminarProducto(idProducto: number): void {
    this.productosOrden.set(this.productosOrden().filter(p => p.idProducto !== idProducto));
  }

  protected actualizarCantidad(idProducto: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminarProducto(idProducto);
      return;
    }

    const actualizados = this.productosOrden().map(p =>
      p.idProducto === idProducto
        ? { ...p, cantidad, subtotal: cantidad * p.precio }
        : p
    );
    this.productosOrden.set(actualizados);
  }

  protected onSubmit(): void {
    if (this.ordenForm.invalid) {
      this.snackBar.open('Por favor, selecciona un cliente', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.productosOrden().length === 0) {
      this.snackBar.open('Debes agregar al menos un producto', 'Cerrar', { duration: 3000 });
      return;
    }

    const ordenDTO: CrearOrdenDTO = {
      idCliente: this.ordenForm.value.idCliente,
      idEmpleado: 1, // TODO: Obtener del usuario autenticado
      observaciones: this.ordenForm.value.observaciones,
      detalles: this.productosOrden().map(p => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad,
        precioUnitario: p.precio
      }))
    };

    this.loading.set(true);

    this.ordenService.crear(ordenDTO).subscribe({
      next: (orden) => {
        this.loading.set(false);
        this.snackBar.open('Orden creada exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/ordenes', orden.idOrden]);
      },
      error: (err) => {
        console.error('Error al crear orden:', err);
        this.loading.set(false);
        this.snackBar.open('Error al crear la orden', 'Cerrar', { duration: 3000 });
      }
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/ordenes']);
  }
}
