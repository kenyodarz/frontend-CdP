import {Component} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {TabsModule} from 'primeng/tabs';

@Component({
  selector: 'app-reportes',
  imports: [RouterOutlet, RouterLink, TabsModule],
  template: `
    <div class="reportes-container">
      <h1 class="text-3xl font-bold mb-6">Reportes</h1>

      <p-tabs value="0">
        <p-tablist>
            <p-tab value="0" routerLink="/reportes/dashboard-proforma">Dashboard Proforma 2025</p-tab>
            <p-tab value="1" routerLink="/reportes/ventas">Ventas</p-tab>

            <p-tab value="3" routerLink="/reportes/productos-mas-vendidos">Productos Más Vendidos</p-tab>
        </p-tablist>
      </p-tabs>

      <div class="mt-6">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .reportes-container {
      padding: 2rem;
    }
  `]
})
export class Reportes {
  constructor(protected readonly router: Router) {
  }
}
