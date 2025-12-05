import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    MenuModule,
    BadgeModule,
    OverlayBadgeModule
  ],
  template: `
    <div class="navbar">
      <span class="app-title">Sistema de Inventario</span>
      <span class="spacer"></span>
      
      <p-overlaybadge [value]="notificationCount().toString()" severity="danger">
        <p-button 
          icon="pi pi-bell" 
          [text]="true"
          [rounded]="true"
          styleClass="navbar-button"
          (click)="notificationsMenu.toggle($event)" />
      </p-overlaybadge>
      
      <p-menu 
        #notificationsMenu 
        [model]="notificationItems" 
        [popup]="true"
        appendTo="body" />

      <p-button 
        icon="pi pi-user" 
        [text]="true"
        [rounded]="true"
        styleClass="navbar-button"
        (click)="userMenu.toggle($event)" />
      
      <p-menu 
        #userMenu 
        [model]="userMenuItems" 
        [popup]="true"
        appendTo="body" />
    </div>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background-color: #1e40af;
      color: white;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-title {
      font-size: 20px;
      font-weight: 600;
    }

    .spacer {
      flex: 1;
    }

    :host ::ng-deep {
      .navbar-button {
        color: white !important;
      }
      
      .navbar-button .p-button-icon {
        color: white !important;
        font-size: 1.25rem;
      }
      
      .navbar-button:hover {
        background-color: rgba(255, 255, 255, 0.15) !important;
      }

      .navbar-button:focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.3) !important;
      }

      .p-overlaybadge .p-badge {
        min-width: 1.25rem;
        height: 1.25rem;
        line-height: 1.25rem;
      }
    }
  `]
})
export class Navbar {
  protected readonly notificationCount = signal(8);

  protected readonly notificationItems: MenuItem[] = [
    {
      label: '5 productos con stock bajo',
      icon: 'pi pi-box',
      command: () => {
        // TODO: Navegar a productos con stock bajo
      }
    },
    {
      label: '3 lotes próximos a vencer',
      icon: 'pi pi-exclamation-triangle',
      command: () => {
        // TODO: Navegar a lotes próximos a vencer
      }
    }
  ];

  protected readonly userMenuItems: MenuItem[] = [
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => {
        // TODO: Navegar a configuración
      }
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        // TODO: Implementar logout
      }
    }
  ];
}