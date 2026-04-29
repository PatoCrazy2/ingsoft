import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="landing animate-in">
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
        background-color: var(--color-bg-app);
      }
      .login-entry {
        font-size: var(--text-xl);
        font-weight: var(--font-bold);
        color: var(--color-primary);
        text-decoration: none;
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-xl);
        border: 2px solid var(--color-primary);
        transition: all var(--duration-base) var(--easing-default);
      }
      .login-entry:hover {
        background-color: var(--color-primary-low);
        transform: translateY(-2px);
      }
      .login-entry:focus-visible {
        outline: 2px solid var(--color-focus-ring);
        outline-offset: 2px;
      }
    `,
  ],
})
export class LandingComponent {}
