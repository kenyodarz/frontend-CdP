import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <mat-spinner [diameter]="diameter" [color]="color" />
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
      color: #666;
      font-size: 14px;
      text-align: center;
    }
  `]
})
export class Loading {
  @Input() message?: string;
  @Input() diameter: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
}
