import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente/cliente';
import { CrearClienteDTO } from '../../../core/models/cliente/crearClienteDTO';
import { Loading } from '../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-form-cliente',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatSnackBarModule,
    Loading,
    ErrorMessage
  ],
  templateUrl: './form-cliente.html',
  styleUrl: './form-cliente.scss',
})
export class FormCliente implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isEditMode = signal(false);
  protected readonly clienteId = signal<number | null>(null);

  protected clienteForm!: FormGroup;

  protected readonly tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'NIT', label: 'NIT' },
    { value: 'CE', label: 'Cédula de Extranjería' }
  ];

  protected readonly tiposTarifa = [
    { value: 'PRECIO_0D', label: '0 Días' },
    { value: 'PRECIO_5D', label: '5 Días' },
    { value: 'PRECIO_10D', label: '10 Días' },
    { value: 'PRECIO_ES', label: 'Especial' },
    { value: 'PRECIO_JM', label: 'Jumbo' },
    { value: 'PRECIO_CR', label: 'Crédito' }
  ];

  ngOnInit(): void {
    this.initForm();
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
      tipoTarifa: ['PRECIO_0D', Validators.required],
      horarioEntrega: ['']
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
      tipoTarifa: cliente.tipoTarifa,
      horarioEntrega: cliente.horarioEntrega
    });
  }

  protected onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000
      });
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
        this.snackBar.open('Cliente creado exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/clientes', clienteCreado.idCliente]);
      },
      error: (err) => {
        console.error('Error al crear cliente:', err);
        this.loading.set(false);
        this.snackBar.open('Error al crear el cliente', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private actualizarCliente(id: number, cliente: CrearClienteDTO): void {
    this.loading.set(true);

    this.clienteService.actualizar(id, cliente).subscribe({
      next: (clienteActualizado) => {
        this.loading.set(false);
        this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/clientes', clienteActualizado.idCliente]);
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.loading.set(false);
        this.snackBar.open('Error al actualizar el cliente', 'Cerrar', {
          duration: 3000
        });
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
