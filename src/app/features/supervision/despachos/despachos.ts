import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-despachos',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Despachos Pendientes de Validación">
      <p>Componente en desarrollo - Aquí se mostrarán los despachos pendientes de validación</p>
    </p-card>
  `
})
export class Despachos { }
