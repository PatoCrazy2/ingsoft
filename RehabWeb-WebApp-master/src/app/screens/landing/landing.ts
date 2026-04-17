import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <main class="landing">
      <h1>RehabWeb</h1>
      <p>Frontend y backend en funcionamiento.</p>
    </main>
  `,
  styles: [
    `
      .landing {
        min-height: 100dvh;
        display: grid;
        place-content: center;
        text-align: center;
        gap: 0.75rem;
      }

      h1 {
        margin: 0;
      }

      p {
        margin: 0;
        color: #4b5563;
      }
    `,
  ],
})
export class LandingComponent {}
