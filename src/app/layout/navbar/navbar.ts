import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    MenuModule,
    BadgeModule
  ],
  template: `
    <div class="navbar">
      <span class="app-title">Sistema de Inventario</span>
      <span class="spacer"></span>
      
      <p-button 
        icon="pi pi-bell" 
        [badge]="notificationCount().toString()" 
        badgeSeverity="danger"
        [text]="true"
        [rounded]="true"
        (click)="notificationsMenu.toggle($event)" />
      
      <p-menu #notificationsMenu [model]="notificationItems" [popup]="true" />

      <p-button 
        icon="pi pi-user" 
        [text]="true"
        [rounded]="true"
        (click)="userMenu.toggle($event)" />
      
      <p-menu #userMenu [model]="userMenuItems" [popup]="true" />
    </div>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background-color: var(--primary-color);
      color: white;
      padding: 0 1rem;
      height: 64px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-title {
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    :host ::ng-deep {
      .p-button.p-button-text {
        color: white;
      }
      
      .p-button.p-button-text:hover {
        background-color: rgba(255, 255, 255, 0.1);
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