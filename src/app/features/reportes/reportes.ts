import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-reportes',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule],
  template: `
    <div class="reportes-container">
      <h1>Reportes</h1>
      
      <nav mat-tab-nav-bar [tabPanel]="tabPanel">
        <a mat-tab-link
           routerLink="/reportes/ventas"
           routerLinkActive #rla1="routerLinkActive"
           [active]="rla1.isActive">
          Ventas
        </a>
        <a mat-tab-link
           routerLink="/reportes/inventario"
           routerLinkActive #rla2="routerLinkActive"
           [active]="rla2.isActive">
          Inventario Valorizado
        </a>
        <a mat-tab-link
           routerLink="/reportes/productos-vendidos"
           routerLinkActive #rla3="routerLinkActive"
           [active]="rla3.isActive">
          Productos Más Vendidos
        </a>
      </nav>
      <mat-tab-nav-panel #tabPanel>
        <router-outlet />
      </mat-tab-nav-panel>
    </div>
  `,
  styles: `
    .reportes-container {
      padding: 24px;
    }
    
    h1 {
      margin: 0 0 24px 0;
      color: #1976d2;
    }
  `
})
export class Reportes {

}
