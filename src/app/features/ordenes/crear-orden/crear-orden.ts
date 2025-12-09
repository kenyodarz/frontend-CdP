import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { CommonModule, CurrencyPipe } from '@angular/common';

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
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    ToastModule,
    InputNumberModule,
    TextareaModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    CurrencyPipe,
    Loading
  ],
  providers: [MessageService],
  templateUrl: './crear-orden.html',
  styleUrl: './crear-orden.scss',
})
export class CrearOrden implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ordenService = inject(OrdenService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly clientes = signal<ClienteSimple[]>([]);
  protected readonly productos = signal<ProductoSimple[]>([]);
  protected readonly productosOrden = signal<ProductoOrden[]>([]);

  // Variables para el selector de productos
  protected selectedProducto: ProductoSimple | null = null;
  protected cantidadProducto: number = 1;

  protected ordenForm!: FormGroup;

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
          ruta: c.nombreRuta,
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

  protected agregarProducto(): void {
    if (!this.selectedProducto || this.cantidadProducto <= 0) return;

    const producto = this.selectedProducto;
    const cantidad = this.cantidadProducto;

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

    // Resetear selección
    this.selectedProducto = null;
    this.cantidadProducto = 1;
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
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, selecciona un cliente' });
      return;
    }

    if (this.productosOrden().length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debes agregar al menos un producto' });
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
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Orden creada exitosamente' });
        setTimeout(() => {
          this.router.navigate(['/ordenes', orden.idOrden]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error al crear orden:', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la orden' });
      }
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/ordenes']);
  }
}
