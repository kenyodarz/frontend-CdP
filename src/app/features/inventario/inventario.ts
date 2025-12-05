import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RegistrarEntrada } from './registrar-entrada/registrar-entrada';

@Component({
  selector: 'app-inventario',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TabsModule, ButtonModule],
  providers: [DialogService],
  template: `
    <div class="inventario-container">
      <div class="header-section">
        <h1>Inventario</h1>
        <div class="actions">
          <p-button 
            label="Nueva Entrada" 
            icon="pi pi-arrow-down" 
            severity="success"
            (onClick)="abrirRegistroEntrada()" />
          <p-button 
            label="Nueva Salida" 
            icon="pi pi-arrow-up" 
            severity="danger"
            [outlined]="true"
            routerLink="/inventario/registrar-salida" />
        </div>
      </div>
      
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

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0;
      color: #1f2937;
      font-size: 1.875rem;
      font-weight: 700;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
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
  private readonly dialogService = inject(DialogService);
  private ref: DynamicDialogRef | null = null;

  protected abrirRegistroEntrada(): void {
    this.ref = this.dialogService.open(RegistrarEntrada, {
      header: 'Registrar Entrada de Inventario',
      width: '95vw',
      height: '90vh',
      maximizable: true,
      modal: true,
      dismissableMask: false
    });

    this.ref?.onClose.subscribe((resultado) => {
      if (resultado?.success) {
        console.log('Documento registrado:', resultado.documento);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
  }
}
