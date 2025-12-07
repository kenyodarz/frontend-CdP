import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Gestión de Rutas">
      <p>Componente en desarrollo - Aquí se gestionarán las asignaciones de rutas</p>
    </p-card>
  `
})
export class Rutas { }
