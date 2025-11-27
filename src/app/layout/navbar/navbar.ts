import { Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-navbar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <span class="app-title">Sistema de Inventario</span>
      <span class="spacer"></span>
      
      <button mat-icon-button [matMenuTriggerFor]="notificaciones">
        <mat-icon [matBadge]="notificationCount()" matBadgeColor="warn">notifications</mat-icon>
      </button>
      
      <mat-menu #notificaciones="matMenu">
        <button mat-menu-item>
          <mat-icon>inventory</mat-icon>
          <span>5 productos con stock bajo</span>
        </button>
        <button mat-menu-item>
          <mat-icon>warning</mat-icon>
          <span>3 lotes próximos a vencer</span>
        </button>
      </mat-menu>

      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item>
          <mat-icon>settings</mat-icon>
          <span>Configuración</span>
        </button>
        <button mat-menu-item>
          <mat-icon>logout</mat-icon>
          <span>Cerrar Sesión</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .app-title {
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }
  `]
})
export class Navbar {
  protected readonly notificationCount = signal(8);
}