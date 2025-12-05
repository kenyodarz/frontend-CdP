import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    PanelMenuModule
  ],
  template: `
    <div class="sidebar">
      <p-panelMenu [model]="menuItems" [multiple]="false" />
    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100%;
      background-color: var(--surface-ground);
      border-right: 1px solid var(--surface-border);
      overflow-y: auto;
    }

    :host ::ng-deep {
      .p-panelmenu {
        border: none;
        width: 100%;
      }

      .p-panelmenu-header-action {
        border-radius: 0;
      }

      .p-panelmenu-content {
        border: none;
      }
    }
  `]
})
export class Sidebar {
  protected readonly menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'Productos',
      icon: 'pi pi-box',
      routerLink: '/productos'
    },
    {
      label: 'Clientes',
      icon: 'pi pi-users',
      routerLink: '/clientes'
    },
    {
      label: 'Órdenes',
      icon: 'pi pi-file',
      routerLink: '/ordenes'
    },
    {
      label: 'Inventario',
      icon: 'pi pi-warehouse',
      routerLink: '/inventario'
    },
    {
      label: 'Reportes',
      icon: 'pi pi-chart-bar',
      routerLink: '/reportes'
    }
  ];
}