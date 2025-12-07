import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-supervision',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TabsModule],
  template: `
    <div class="supervision-container">
      <div class="header-section">
        <h1>Supervisión</h1>
      </div>

      <p-tabs value="0">
        <p-tablist>
          <p-tab value="0" routerLink="/supervision/dashboard" routerLinkActive="active-tab">
            <i class="pi pi-chart-line"></i>
            <span>Dashboard</span>
          </p-tab>
          <p-tab value="1" routerLink="/supervision/ordenes" routerLinkActive="active-tab">
            <i class="pi pi-shopping-cart"></i>
            <span>Órdenes</span>
          </p-tab>
          <p-tab value="2" routerLink="/supervision/despachos" routerLinkActive="active-tab">
            <i class="pi pi-truck"></i>
            <span>Despachos</span>
          </p-tab>
          <p-tab value="3" routerLink="/supervision/rutas" routerLinkActive="active-tab">
            <i class="pi pi-map-marker"></i>
            <span>Rutas</span>
          </p-tab>
          <p-tab value="4" routerLink="/supervision/inventario" routerLinkActive="active-tab">
            <i class="pi pi-box"></i>
            <span>Inventario</span>
          </p-tab>
        </p-tablist>
      </p-tabs>

      <div class="content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .supervision-container {
      padding: 1.5rem;
    }

    .header-section {
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0;
      color: #1f2937;
      font-size: 1.875rem;
      font-weight: 700;
    }

    .content {
      margin-top: 1.5rem;
    }

    :host ::ng-deep {
      .p-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .p-tab i {
        font-size: 1rem;
      }
    }
  `]
})
export class Supervision { }
