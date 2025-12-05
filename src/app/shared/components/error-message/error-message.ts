import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-error-message',
  imports: [CardModule, ButtonModule],
  template: `
    <div class="error-container">
      <p-card styleClass="error-card">
        <div class="error-content">
          <i class="pi pi-exclamation-circle error-icon"></i>
          <h3 class="error-title">{{ title }}</h3>
          <p class="error-message">{{ message }}</p>
          @if (showRetry) {
            <p-button label="Reintentar" icon="pi pi-refresh" (onClick)="onRetry()" />
          }
        </div>
      </p-card>
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

    :host ::ng-deep .error-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
    }

    .error-icon {
      font-size: 4rem;
      color: var(--p-red-500);
      margin-bottom: 1rem;
    }

    .error-title {
      margin: 0 0 0.5rem 0;
      color: var(--p-text-color);
      font-size: 1.5rem;
      font-weight: 500;
    }

    .error-message {
      margin: 0 0 1.5rem 0;
      color: var(--p-text-color-secondary);
      font-size: 1rem;
      line-height: 1.5;
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
