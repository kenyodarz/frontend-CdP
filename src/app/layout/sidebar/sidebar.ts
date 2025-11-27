import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <mat-nav-list class="sidebar">
      @for (item of menuItems; track item.route) {
        <a mat-list-item
           [routerLink]="item.route"
           routerLinkActive="active"
           class="menu-item">
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      }
    </mat-nav-list>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100%;
      background-color: white;
      border-right: 1px solid #e0e0e0;
      padding-top: 8px;
    }

    .menu-item {
      margin: 4px 8px;
      border-radius: 8px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        background-color: #e3f2fd;
        color: #1976d2;
        
        mat-icon {
          color: #1976d2;
        }
      }
    }
  `]
})
export class Sidebar {
  protected readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Productos', icon: 'inventory_2', route: '/productos' },
    { label: 'Clientes', icon: 'people', route: '/clientes' },
    { label: 'Órdenes', icon: 'receipt_long', route: '/ordenes' },
    { label: 'Inventario', icon: 'warehouse', route: '/inventario' },
    { label: 'Reportes', icon: 'bar_chart', route: '/reportes' }
  ];
}