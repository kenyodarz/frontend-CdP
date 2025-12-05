import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <nav class="sidebar">
      @for (item of menuItems; track item.route) {
        <a 
          [routerLink]="item.route" 
          routerLinkActive="active" 
          class="menu-item">
          <i [class]="'pi ' + item.icon"></i>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100%;
      background-color: #ffffff;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      padding: 1rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: #6b7280;
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .menu-item i {
      font-size: 1.25rem;
      width: 1.25rem;
      text-align: center;
    }

    .menu-item:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .menu-item.active {
      background-color: #eff6ff;
      color: #2563eb;
      border-left-color: #2563eb;
    }

    .menu-item.active i {
      color: #2563eb;
    }
  `]
})
export class Sidebar {
  protected readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard' },
    { label: 'Productos', icon: 'pi-box', route: '/productos' },
    { label: 'Clientes', icon: 'pi-users', route: '/clientes' },
    { label: 'Órdenes', icon: 'pi-file', route: '/ordenes' },
    { label: 'Inventario', icon: 'pi-warehouse', route: '/inventario' },
    { label: 'Reportes', icon: 'pi-chart-bar', route: '/reportes' }
  ];
}