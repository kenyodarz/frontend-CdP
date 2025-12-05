import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Sidebar } from './layout/sidebar/sidebar';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Sidebar, ConfirmDialogModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="app-container">
      <app-navbar />
      <div class="app-body">
        <app-sidebar />
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
      <p-confirmDialog />
      <p-toast />
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      background-color: #f5f5f5;
      padding: 20px;
    }
  `]
})
export class App {
  protected readonly title = signal('frontend');
}
