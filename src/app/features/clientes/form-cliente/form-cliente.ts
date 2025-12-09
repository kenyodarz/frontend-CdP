import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';

import { ClienteService } from '../../../core/services/cliente.service';
import { RutaService } from '../../../core/services/ruta.service';
import { Cliente } from '../../../core/models/cliente/cliente';
import { CrearClienteDTO } from '../../../core/models/cliente/crearClienteDTO';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-form-cliente',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    SelectModule,
    ToastModule,
    FloatLabelModule,
    Loading,
    ErrorMessage
  ],
  providers: [MessageService],
  templateUrl: './form-cliente.html',
  styleUrl: './form-cliente.scss',
})
export class FormCliente implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly rutaService = inject(RutaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isEditMode = signal(false);
  protected readonly clienteId = signal<number | null>(null);
  protected readonly rutas = signal<any[]>([]);

  protected clienteForm!: FormGroup;

  protected readonly tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'NIT', label: 'NIT' },
    { value: 'CE', label: 'Cédula de Extranjería' }
  ];

  protected readonly tiposTarifa = [
    { value: 'PRECIO_0D', label: 'Normal' },
    { value: 'PRECIO_5D', label: '5% de Descuento' },
    { value: 'PRECIO_10D', label: '10% de Descuento' },
    { value: 'PRECIO_ES', label: '15% de Descuento' },
    { value: 'PRECIO_JM', label: 'Especial 1' },
    { value: 'PRECIO_CR', label: 'Especial 2' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.cargarRutas();
    this.checkEditMode();
  }

  private initForm(): void {
    this.clienteForm = this.fb.group({
      codigo: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipoDocumento: ['CC'],
      numeroDocumento: [''],
      telefono: [''],
      direccion: [''],
      barrio: [''],
      comuna: [''],
      tipoNegocio: [''],
      idRuta: [null],
      tipoTarifa: ['PRECIO_0D', Validators.required],
      horarioEntrega: [''],
      estado: ['ACTIVO']
    });
  }

  private cargarRutas(): void {
    this.rutaService.obtenerTodas().subscribe({
      next: (rutas) => {
        this.rutas.set(rutas.map(r => ({ value: r.idRuta, label: r.nombre })));
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.isEditMode.set(true);
      this.clienteId.set(+id);
      this.cargarCliente(+id);
    }
  }

  private cargarCliente(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.clienteService.obtenerPorId(id).subscribe({
      next: (cliente) => {
        this.llenarFormulario(cliente);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar cliente:', err);
        this.error.set('No se pudo cargar el cliente.');
        this.loading.set(false);
      }
    });
  }

  private llenarFormulario(cliente: Cliente): void {
    this.clienteForm.patchValue({
      codigo: cliente.codigo,
      nombre: cliente.nombre,
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      barrio: cliente.barrio,
      comuna: cliente.comuna,
      tipoNegocio: cliente.tipoNegocio,
      idRuta: cliente.idRuta,
      tipoTarifa: cliente.tipoTarifa,
      horarioEntrega: cliente.horarioEntrega,
      estado: cliente.estado
    });
  }

  protected onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, completa todos los campos requeridos' });
      return;
    }

    const clienteDTO: CrearClienteDTO = this.clienteForm.value;

    if (this.isEditMode() && this.clienteId()) {
      this.actualizarCliente(this.clienteId()!, clienteDTO);
    } else {
      this.crearCliente(clienteDTO);
    }
  }

  private crearCliente(cliente: CrearClienteDTO): void {
    this.loading.set(true);

    this.clienteService.crear(cliente).subscribe({
      next: (clienteCreado) => {
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado exitosamente' });
        setTimeout(() => {
          this.router.navigate(['/clientes', clienteCreado.idCliente]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error al crear cliente:', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el cliente' });
      }
    });
  }

  private actualizarCliente(id: number, cliente: CrearClienteDTO): void {
    this.loading.set(true);

    this.clienteService.actualizar(id, cliente).subscribe({
      next: (clienteActualizado) => {
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado exitosamente' });
        setTimeout(() => {
          this.router.navigate(['/clientes', clienteActualizado.idCliente]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el cliente' });
      }
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/clientes']);
  }

  protected onRetry(): void {
    if (this.clienteId()) {
      this.cargarCliente(this.clienteId()!);
    }
  }
}
