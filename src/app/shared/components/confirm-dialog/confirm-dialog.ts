import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      @if (data.icon) {
        <mat-icon class="dialog-icon">{{ data.icon }}</mat-icon>
      }
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p class="dialog-message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || 'Cancelar' }}
      </button>
      <button 
        mat-raised-button 
        [color]="data.confirmColor || 'primary'" 
        (click)="onConfirm()">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 24px 24px 16px;
    }

    .dialog-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    mat-dialog-content {
      padding: 0 24px;
      min-width: 300px;
    }

    .dialog-message {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }

    mat-dialog-actions {
      padding: 16px 24px 24px;
      gap: 8px;
    }
  `]
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
