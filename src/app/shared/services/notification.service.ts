import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  };

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, duration?: number): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration: duration || this.defaultConfig.duration,
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, duration?: number): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration: duration || this.defaultConfig.duration,
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, duration?: number): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration: duration || this.defaultConfig.duration,
      panelClass: ['snackbar-warning']
    });
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, duration?: number): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration: duration || this.defaultConfig.duration,
      panelClass: ['snackbar-info']
    });
  }
}
