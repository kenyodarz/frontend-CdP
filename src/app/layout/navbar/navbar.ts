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
    <div class="navbar flex align-items-center gap-3 px-4 sticky top-0 z-5 shadow-2" style="height: 64px; background-color: #5D1F1F;">
      <img src="assets/img/Logo-castipan.png" alt="Castillo del Pan" class="navbar-logo" style="height: 48px; width: auto;" />
      <span class="text-lg font-medium text-white">Sistema de Inventario</span>
      <span class="flex-1"></span>
      
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
        styleClass="navbar-menu"
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
        styleClass="navbar-menu"
        appendTo="body" />
    </div>
  `,
  styles: [`
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

      /* Fix menu positioning to open to the left */
      .navbar-menu.p-menu {
        transform: translateX(-100%) !important;
        margin-left: 0 !important;
        min-width: 250px;
        max-width: 300px;
      }

      /* Ensure menu doesn't overflow screen */
      .navbar-menu.p-menu .p-menuitem-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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