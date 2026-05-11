import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="landing">
      <div class="glass-container animate-in">
        <header class="header">
          <div class="logo-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon"><path d="M20.42 4.58a10 10 0 1 1-14.42 0"></path><polyline points="12 2 12 12"></polyline></svg>
          </div>
          <h1 class="title">Rehab<span>Web</span></h1>
          <p class="subtitle">Plataforma Inteligente de Fisioterapia</p>
        </header>

        <section class="role-selection">
          <h2 class="selection-title">Selecciona tu perfil de acceso</h2>
          
          <div class="roles-grid">
            <button class="role-card" (click)="selectRole('Terapeuta')">
              <div class="role-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="role-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
              </div>
              <div class="role-info">
                <h3>Terapeuta</h3>
                <p>Gestionar pacientes y asignar rutinas clínicas.</p>
              </div>
            </button>

            <button class="role-card" (click)="selectRole('Admin')">
              <div class="role-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="role-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div class="role-info">
                <h3>Administrador</h3>
                <p>Validar ejercicios y gestionar el catálogo clínico.</p>
              </div>
            </button>

            <button class="role-card" (click)="selectRole('Paciente')">
              <div class="role-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="role-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div class="role-info">
                <h3>Paciente</h3>
                <p>Realizar mis rutinas y ver mi progreso terapéutico.</p>
              </div>
            </button>
          </div>
        </section>

        <footer class="footer">
          <p>&copy; 2026 RehabWeb. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  `,
  styles: [`
    .landing {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, var(--color-primary-low) 0%, var(--color-bg-app) 50%);
      padding: var(--space-4);
      position: relative;
      overflow: hidden;
    }

    .landing::before {
      content: '';
      position: absolute;
      width: 40vw;
      height: 40vw;
      background: var(--color-primary);
      filter: blur(100px);
      opacity: 0.05;
      top: -10vw;
      right: -10vw;
      border-radius: 50%;
    }

    .glass-container {
      width: 100%;
      max-width: 900px;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-7);
      box-shadow: var(--shadow-lg);
      z-index: 1;
    }

    .header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .logo-circle {
      width: 64px;
      height: 64px;
      background: var(--color-primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-3);
      box-shadow: 0 8px 16px rgba(0, 167, 129, 0.3);
    }

    .logo-icon { width: 32px; height: 32px; }

    .title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin: 0;
      letter-spacing: -0.5px;
    }

    .title span { color: var(--color-primary); }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: var(--text-m);
      margin-top: var(--space-1);
    }

    .selection-title {
      font-size: var(--text-l);
      font-weight: var(--font-medium);
      color: var(--color-text-primary);
      text-align: center;
      margin-bottom: var(--space-5);
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .role-card {
      background: var(--color-bg-app);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      text-align: left;
      cursor: pointer;
      transition: all var(--duration-base) var(--easing-default);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .role-card:hover {
      background: white;
      border-color: var(--color-primary);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .role-icon-wrapper {
      width: 48px;
      height: 48px;
      background: var(--color-primary-low);
      color: var(--color-primary);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--duration-base);
    }

    .role-card:hover .role-icon-wrapper {
      background: var(--color-primary);
      color: white;
    }

    .role-icon { width: 24px; height: 24px; }

    .role-info h3 {
      font-size: var(--text-m);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-1);
    }

    .role-info p {
      font-size: var(--text-s);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: var(--leading-tight);
    }

    .footer {
      text-align: center;
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-4);
      color: var(--color-text-muted);
      font-size: var(--text-xs);
    }

    @media (max-width: 600px) {
      .glass-container { padding: var(--space-4); }
      .roles-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  async selectRole(role: 'Terapeuta' | 'Admin' | 'Paciente') {
    await this.auth.loginByRole(role);
    this.router.navigate(['/home']);
  }
}
