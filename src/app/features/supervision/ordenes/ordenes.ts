import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Órdenes Pendientes de Aprobación">
      <p>Componente en desarrollo - Aquí se mostrarán las órdenes pendientes de aprobación</p>
      <p>Funcionalidades:</p>
      <ul>
        <li>Lista de órdenes pendientes</li>
        <li>Botón Aprobar/Rechazar</li>
        <li>Campo de comentarios</li>
        <li>Historial de aprobaciones</li>
      </ul>
    </p-card>
  `
})
export class Ordenes { }
