import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Abre un diálogo de confirmación
   * @returns Observable que emite true si se confirma, false si se cancela
   */
  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar',
    confirmColor: 'primary' | 'accent' | 'warn' = 'primary',
    icon?: string
  ): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title,
        message,
        confirmText,
        cancelText,
        confirmColor,
        icon
      } as ConfirmDialogData
    });

    return dialogRef.afterClosed();
  }

  /**
   * Diálogo de confirmación para eliminar
   */
  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      'Eliminar',
      'Cancelar',
      'warn',
      'delete'
    );
  }

  /**
   * Diálogo de confirmación para desactivar
   */
  confirmDeactivate(itemName: string): Observable<boolean> {
    return this.confirm(
      'Confirmar desactivación',
      `¿Estás seguro de que deseas desactivar "${itemName}"?`,
      'Desactivar',
      'Cancelar',
      'warn',
      'block'
    );
  }

  /**
   * Diálogo de confirmación para cancelar
   */
  confirmCancel(message: string = '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.'): Observable<boolean> {
    return this.confirm(
      'Confirmar cancelación',
      message,
      'Sí, cancelar',
      'No',
      'warn',
      'warning'
    );
  }
}
