import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    @if (auth.ready()) {
      <div class="app-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="logo-icon"><path d="M20.42 4.58a10 10 0 1 1-14.42 0"></path><polyline points="12 2 12 12"></polyline></svg>
              <span class="logo-text">Rehab<span>Web</span></span>
            </div>
          </div>

          <nav class="nav-menu">
            <div class="nav-section">
              <p class="section-title">General</p>
              <a routerLink="/home" routerLinkActive="active" class="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Dashboard</span>
              </a>
            </div>

            <!-- Secciones para Paciente -->
            <div class="nav-section" *ngIf="isPaciente()">
              <p class="section-title">Mi rehabilitación</p>
              <a routerLink="/ejercicios" routerLinkActive="active" class="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>Catálogo de ejercicios</span>
              </a>
            </div>

            <!-- Secciones para Terapeuta / Admin -->
            <div class="nav-section" *ngIf="isTerapeuta() || isAdmin()">
              <p class="section-title">Clínica</p>
              <a routerLink="/ejercicios" routerLinkActive="active" class="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>Biblioteca</span>
              </a>
              <a routerLink="/rutinas/nueva" routerLinkActive="active" class="nav-item" *ngIf="isTerapeuta()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
                <span>Nueva Rutina</span>
              </a>
            </div>

            <!-- Secciones para Admin -->
            <div class="nav-section" *ngIf="isAdmin()">
              <p class="section-title">Gestión</p>
              <a routerLink="/ejercicios/admin" routerLinkActive="active" class="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                <span>Administrar Ejercicios</span>
              </a>
            </div>
          </nav>

          <div class="sidebar-footer">
            <div class="user-info">
              <div class="user-avatar">{{ userInitial() }}</div>
              <div class="user-details">
                <p class="user-name">{{ userRole() }}</p>
                <p class="user-status">En línea</p>
              </div>
            </div>
            <button class="logout-btn" (click)="logout()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    } @else {
      <div class="initial-load">
        <div class="spinner-elegant"></div>
        <p>Sincronizando con el servidor clínico...</p>
      </div>
    }
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100dvh;
      background-color: var(--color-bg-app);
    }

    .initial-load {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-app);
      color: var(--color-text-secondary);
    }
    
    .spinner-elegant {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-primary-low);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-3);
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* SIDEBAR */
    .sidebar {
      width: 280px;
      background-color: var(--color-bg-card);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100dvh;
      z-index: 100;
    }

    .sidebar-header {
      padding: var(--space-5) var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .logo-icon {
      width: 28px;
      height: 28px;
      color: var(--color-primary);
    }

    .logo-text {
      font-size: var(--text-l);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      letter-spacing: -0.5px;
    }

    .logo-text span { color: var(--color-primary); }

    .nav-menu {
      flex: 1;
      padding: var(--space-4);
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: var(--space-5);
    }

    .section-title {
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      margin-bottom: var(--space-2);
      padding-left: var(--space-3);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-weight: var(--font-medium);
      font-size: var(--text-s);
      text-decoration: none;
      transition: all var(--duration-base) var(--easing-default);
      margin-bottom: var(--space-1);
    }

    .nav-item:hover {
      background-color: var(--color-primary-low);
      color: var(--color-primary);
    }

    .nav-item.active {
      background-color: var(--color-primary-low);
      color: var(--color-primary);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
    }

    /* SIDEBAR FOOTER */
    .sidebar-footer {
      padding: var(--space-4);
      border-top: 1px solid var(--color-border);
      background-color: var(--color-bg-app);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: var(--color-primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-bold);
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-size: var(--text-s);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .user-status {
      font-size: var(--text-xs);
      color: var(--color-primary);
      margin: 0;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      background: none;
      border: 1px solid var(--color-border);
      cursor: pointer;
      font-weight: var(--font-medium);
      font-size: var(--text-s);
      transition: all var(--duration-base);
    }

    .logout-btn:hover {
      background-color: var(--color-danger-bg);
      color: var(--color-danger);
      border-color: var(--color-danger);
    }

    /* CONTENT AREA */
    .content-area {
      flex: 1;
      height: 100dvh;
      overflow-y: auto;
      padding: var(--space-5);
    }

    @media (max-width: 900px) {
      .sidebar {
        width: 80px;
      }
      .logo-text, .section-title, .nav-item span, .user-details, .logout-btn span {
        display: none;
      }
      .nav-item, .logout-btn {
        justify-content: center;
        padding: var(--space-3);
      }
    }
  `]
})
export class MainLayoutComponent {
  public readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    void this.auth.asegurarSesion();
  }

  userRole = this.auth.role;
  isAdmin = computed(() => this.auth.role() === 'Admin');
  isTerapeuta = computed(() => this.auth.role() === 'Terapeuta');
  isPaciente = computed(() => this.auth.role() === 'Paciente');

  userInitial = computed(() => (this.auth.role() || 'U')[0]);

  logout() {
    this.auth.logout();
    this.router.navigate(['/landing']);
  }
}
