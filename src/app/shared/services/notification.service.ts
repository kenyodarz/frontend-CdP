import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly messageService = inject(MessageService);

  private readonly defaultDuration = 3000;

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: duration || this.defaultDuration
    });
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: duration || this.defaultDuration
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      life: duration || this.defaultDuration
    });
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: message,
      life: duration || this.defaultDuration
    });
  }
}
