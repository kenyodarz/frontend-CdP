import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-message',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="error-container">
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-content">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h3 class="error-title">{{ title }}</h3>
            <p class="error-message">{{ message }}</p>
            @if (showRetry) {
              <button mat-raised-button color="primary" (click)="onRetry()">
                <mat-icon>refresh</mat-icon>
                Reintentar
              </button>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      min-height: 200px;
    }

    .error-card {
      max-width: 500px;
      width: 100%;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-title {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 20px;
      font-weight: 500;
    }

    .error-message {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    button {
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class ErrorMessage {
  @Input() title: string = 'Error';
  @Input() message: string = 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  @Input() showRetry: boolean = true;
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
