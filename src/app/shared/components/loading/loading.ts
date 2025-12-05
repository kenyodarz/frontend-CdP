import { Component, Input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  imports: [ProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <p-progressSpinner ariaLabel="loading" [style]="{width: diameter + 'px', height: diameter + 'px'}" strokeWidth="4" />
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      min-height: 200px;
    }

    .loading-message {
      margin-top: 16px;
      color: var(--p-text-color-secondary);
      font-size: 14px;
      text-align: center;
    }
  `]
})
export class Loading {
  @Input() message?: string;
  @Input() diameter: number = 50;
  // Color prop is not directly mapped in PrimeNG spinner same way, usually handled by CSS or stroke color
  @Input() color: string = 'primary';
}
