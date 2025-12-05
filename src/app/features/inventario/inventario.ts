import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-inventario',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TabsModule],
  template: `
    <div class="inventario-container">
      <h1>Inventario</h1>
      
      <p-tabs value="0">
        <p-tablist>
          <p-tab value="0" routerLink="/inventario/lotes" routerLinkActive="active-tab">
            <i class="pi pi-box"></i>
            <span>Lotes</span>
          </p-tab>
          <p-tab value="1" routerLink="/inventario/movimientos" routerLinkActive="active-tab">
            <i class="pi pi-sync"></i>
            <span>Movimientos</span>
          </p-tab>
          <p-tab value="2" routerLink="/inventario/crear-lote" routerLinkActive="active-tab">
            <i class="pi pi-plus"></i>
            <span>Crear Lote</span>
          </p-tab>
          <p-tab value="3" routerLink="/inventario/registrar-entrada" routerLinkActive="active-tab">
            <i class="pi pi-arrow-down"></i>
            <span>Registrar Entrada</span>
          </p-tab>
          <p-tab value="4" routerLink="/inventario/registrar-salida" routerLinkActive="active-tab">
            <i class="pi pi-arrow-up"></i>
            <span>Registrar Salida</span>
          </p-tab>
        </p-tablist>
      </p-tabs>

      <div class="content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .inventario-container {
      padding: 1.5rem;
    }

    h1 {
      margin: 0 0 1.5rem 0;
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
export class Inventario {

}
