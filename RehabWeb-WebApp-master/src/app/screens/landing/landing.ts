import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="landing">
      <a routerLink="/home" class="login-entry">Entrar</a>
    </main>
  `,
  styles: [
    `
      .landing {
        min-height: 100dvh;
        display: grid;
        place-content: center;
        text-align: center;
      }
      .login-entry {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2563eb;
        text-decoration: none;
      }
      .login-entry:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LandingComponent {}
