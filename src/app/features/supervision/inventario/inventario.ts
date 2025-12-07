import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-inventario-supervision',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Validación de Inventario">
      <p>Componente en desarrollo - Aquí se validarán las entradas de inventario</p>
    </p-card>
  `
})
export class InventarioSupervision { }
