import { Component, signal, OnInit, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Badge } from 'primeng/badge';
import { OverlayBadge } from 'primeng/overlaybadge';
import { ReporteService } from '../../core/services/reporte.service';

interface Notification {
  icon: string;
  text: string;
  severity?: 'info' | 'warning' | 'danger';
}

@Component({
  selector: 'app-navbar',
  imports: [
    Button,
    Popover,
    OverlayBadge
  ],
  template: `
    <div class="navbar flex align-items-center gap-3 px-4 sticky top-0 z-5 shadow-2" style="height: 64px; background-color: #5D1F1F;">
      <img src="assets/img/Logo-castipan.png" alt="Castillo del Pan" class="navbar-logo" style="height: 48px; width: auto;" />
      <span class="text-lg font-medium text-white">Sistema de Inventario</span>
      <span class="flex-1"></span>

      <p-overlayBadge [value]="notificationCount().toString()" severity="danger">
        <p-button
          icon="pi pi-bell"
          [text]="true"
          [rounded]="true"
          styleClass="navbar-button"
          (onClick)="notificationsPopover.toggle($event)" />
      </p-overlayBadge>

      <p-popover #notificationsPopover styleClass="notifications-popover">
        <div class="notifications-container">
          <div class="notification-header px-3 py-2 border-bottom-1 surface-border">
            <span class="font-semibold text-900">Notificaciones</span>
          </div>
          <div class="notification-list">
            @for (notif of notifications(); track notif.text) {
              <div
                class="notification-item flex align-items-start gap-3 p-3 cursor-pointer hover:surface-hover"
                (click)="onNotificationClick(notif); notificationsPopover.hide()">
                <i [class]="notif.icon"
                   [class.text-blue-500]="notif.severity === 'info'"
                   [class.text-orange-500]="notif.severity === 'warning'"
                   [class.text-red-500]="notif.severity === 'danger'"
                   class="text-xl"></i>
                <span class="text-sm text-900 flex-1">{{ notif.text }}</span>
              </div>
            }
          </div>
        </div>
      </p-popover>

      <p-button
        icon="pi pi-user"
        [text]="true"
        [rounded]="true"
        styleClass="navbar-button"
        (onClick)="userPopover.toggle($event)" />

      <p-popover #userPopover styleClass="user-popover">
        <div class="user-menu-container">
          <div
            class="menu-item flex align-items-center gap-3 p-3 cursor-pointer hover:surface-hover"
            (click)="onSettingsClick(); userPopover.hide()">
            <i class="pi pi-cog text-lg"></i>
            <span class="text-900">Configuración</span>
          </div>
          <div class="border-top-1 surface-border"></div>
          <div
            class="menu-item flex align-items-center gap-3 p-3 cursor-pointer hover:surface-hover"
            (click)="onLogoutClick(); userPopover.hide()">
            <i class="pi pi-sign-out text-lg text-red-500"></i>
            <span class="text-900">Cerrar Sesión</span>
          </div>
        </div>
      </p-popover>
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

      /* Popover de notificaciones */
      .notifications-popover.p-popover {
        width: 320px;
        max-width: 90vw;
      }

      .notifications-popover .p-popover-content {
        padding: 0;
      }

      .notifications-container {
        max-height: 400px;
        overflow-y: auto;
      }

      .notification-list {
        min-height: 100px;
      }

      .notification-item {
        transition: background-color 0.2s;
        border-bottom: 1px solid var(--surface-border);
      }

      .notification-item:last-child {
        border-bottom: none;
      }

      .notification-item:hover {
        background-color: var(--surface-hover);
      }

      /* Popover de usuario */
      .user-popover.p-popover {
        width: 220px;
      }

      .user-popover .p-popover-content {
        padding: 0;
      }

      .menu-item {
        transition: background-color 0.2s;
      }

      .menu-item:hover {
        background-color: var(--surface-hover);
      }
    }
  `]
})
export class Navbar implements OnInit {
  private readonly reporteService = inject(ReporteService);

  protected readonly notificationCount = signal(0);

  protected readonly notifications = signal<Notification[]>([]);

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  private cargarNotificaciones(): void {
    this.reporteService.obtenerDashboard().subscribe({
      next: (dashboard) => {
        const notifs: Notification[] = [];

        // Notificación de productos con stock bajo
        if (dashboard.productosStockBajo > 0) {
          notifs.push({
            icon: 'pi pi-box',
            text: `${dashboard.productosStockBajo} producto${dashboard.productosStockBajo > 1 ? 's' : ''} con stock bajo`,
            severity: 'warning'
          });
        }

        // TODO: Agregar notificación de lotes próximos a vencer cuando esté disponible en el backend

        this.notifications.set(notifs);
        this.notificationCount.set(notifs.length);
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        // Mantener notificaciones vacías en caso de error
        this.notifications.set([]);
        this.notificationCount.set(0);
      }
    });
  }

  protected onNotificationClick(notification: Notification): void {
    console.log('Notificación clickeada:', notification);
    // TODO: Navegar según el tipo de notificación
  }

  protected onSettingsClick(): void {
    console.log('Ir a configuración');
    // TODO: Navegar a configuración
  }

  protected onLogoutClick(): void {
    console.log('Cerrar sesión');
    // TODO: Implementar logout
  }
}
