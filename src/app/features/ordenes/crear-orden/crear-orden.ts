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
    Loading
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
    // Solicitar una página grande para obtener todos los clientes para el selector
    this.clienteService.obtenerTodos(0, 1000).subscribe({
      next: (page) => {
        // Mapear Cliente[] a ClienteSimple[]
        const clientesSimple: ClienteSimple[] = page.content.map(c => ({
          idCliente: c.idCliente!,
          codigo: c.codigo,
          nombre: c.nombre,
          telefono: c.telefono,
          barrio: c.barrio,
          ruta: c.ruta?.nombre,
          tipoTarifa: c.tipoTarifa,
          estado: c.estado
        }));
        this.clientes.set(clientesSimple);
      },
      error: (err) => console.error('Error al cargar clientes:', err)
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
          precio: producto.precioBase,
          cantidad,
          subtotal: producto.precioBase * cantidad
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
      observaciones: this.ordenForm.value.observaciones,
      detalles: this.productosOrden().map(p => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad
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
