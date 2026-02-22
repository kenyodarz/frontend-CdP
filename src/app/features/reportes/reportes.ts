import {Component} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {TabsModule} from 'primeng/tabs';

@Component({
  selector: 'app-reportes',
  imports: [RouterOutlet, RouterLink, TabsModule],
  template: `
    <div class="reportes-container">
      <p-tabs value="0">
        <p-tablist>
          <p-tab value="0" routerLink="/reportes/ventas">Ventas</p-tab>
          <p-tab value="1" routerLink="/reportes/productos-mas-vendidos">Productos</p-tab>
          <p-tab value="2" routerLink="/reportes/dashboard-proforma">Reportes</p-tab>
        </p-tablist>
      </p-tabs>

      <div class="report-content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .reportes-container {
      padding: 0;
    }

    .report-content {
      padding: 0;
    }
  `]
})
export class Reportes {
  constructor(protected readonly router: Router) {
  }
}
