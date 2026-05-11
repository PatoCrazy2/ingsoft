import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioPreviewComponent } from '../../components/ejercicio-preview/ejercicio-preview.component';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EjercicioPreviewComponent,
  ],
  template: `
    <div class="detail-page animate-in">
      <div class="container py-4">
        @if (cargando()) {
          <div class="loading-state">
            <div class="spinner-elegant"></div>
            <p>Preparando ficha clínica…</p>
          </div>
        } @else if (ejercicio()) {
          <app-ejercicio-preview [ejercicio]="ejercicio()!"></app-ejercicio-preview>
        } @else {
          <div class="error-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <p>No se pudo cargar el ejercicio solicitado.</p>
            <a routerLink="/ejercicios" class="btn-back">Regresar a la Biblioteca</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-page { min-height: 80vh; }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) 0;
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

    .error-state {
      max-width: 500px;
      margin: var(--space-8) auto;
      text-align: center;
      padding: var(--space-7);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
    }

    .error-icon { width: 48px; height: 48px; color: var(--color-warning); margin-bottom: var(--space-3); }

    .btn-back {
      display: inline-block;
      margin-top: var(--space-4);
      padding: var(--space-2) var(--space-5);
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      font-weight: var(--font-bold);
      border-radius: var(--radius-pill);
      transition: all var(--duration-base);
      &:hover { transform: translateY(-1px); filter: brightness(1.1); }
    }
  `]
})
export class EjercicioDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(EjercicioService);

  readonly cargando = signal(true);
  readonly ejercicio = signal<Ejercicio | undefined>(undefined);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.cargando.set(false);
      return;
    }
    this.service.getEjercicio(id).subscribe({
      next: (data) => {
        this.ejercicio.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        void this.router.navigate(['/ejercicios']);
      },
    });
  }
}
