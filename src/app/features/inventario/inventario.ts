import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-inventario',
  imports: [RouterOutlet],
  template: `
    <div class="inventario-container">
      <router-outlet />
    </div>
  `,
  styles: [`
    .inventario-container {
      padding: 1.5rem;
      height: 100%;
      background-color: #f8fafc;
    }
  `]
})
export class Inventario {
}
