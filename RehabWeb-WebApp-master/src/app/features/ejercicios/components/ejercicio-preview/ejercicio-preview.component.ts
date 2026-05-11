import { Component, Input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Ejercicio } from '../../models/ejercicio.model';
import { MatButtonModule } from '@angular/material/button';

/**
 * Vista premium de ficha (detalle / validación).
 */
@Component({
  selector: 'app-ejercicio-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="preview-container animate-in" *ngIf="ejercicio">
      <div class="media-section">
        <div class="overlay-controls p-4">
           <button class="back-btn-elegant" (click)="goBack()" title="Regresar">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="back-icon"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
        </div>
        
        <ng-container *ngIf="ejercicio.video_url; else imageSection">
           <div class="video-placeholder d-flex flex-column align-items-center justify-content-center">
              <div class="play-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" class="play-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
              <p class="mt-4 text-white fw-bold tracking-wide">REPRODUCIR VIDEO INSTRUCTIVO</p>
           </div>
        </ng-container>
        <ng-template #imageSection>
          <div class="hero-image" [style.backgroundImage]="'url(' + (ejercicio.imagen_url || 'assets/placeholder-exercise.jpg') + ')'"></div>
        </ng-template>
      </div>

      <div class="detail-content p-5">
        <div class="header-row d-flex justify-content-between align-items-start mb-4">
          <div>
            <div class="d-flex align-items-center gap-3 mb-2">
              <span class="badge-premium">{{ ejercicio.categoria }}</span>
              <div class="difficulty-group">
                <span class="difficulty-indicator" [ngClass]="(ejercicio.dificultad ?? 'FACIL').toLowerCase()"></span>
                <span class="difficulty-text">{{ ejercicio.dificultad }}</span>
              </div>
            </div>
            <h1 class="display-title">{{ ejercicio.nombre }}</h1>
          </div>
          <div class="score-pill">
            <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>{{ ejercicio.puntuacion_media || '5.0' }}</span>
          </div>
        </div>

        <div class="row g-5">
          <div class="col-lg-8">
            <section class="info-section">
              <div class="section-label">Descripción Técnica</div>
              <p class="lead-text">{{ ejercicio.descripcion }}</p>
            </section>

            <section class="info-section">
              <div class="section-label">Protocolo de ejecución</div>
              <div class="instruction-box">
                 <div class="instruction-inner">
                    {{ ejercicio.instrucciones }}
                 </div>
              </div>
            </section>
          </div>

          <div class="col-lg-4">
            <div class="info-sidebar sticky-top" style="top: 2rem;">
              <div class="side-card equip-card">
                <div class="side-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="side-icon"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v8H2z"></path><line x1="6" y1="12" x2="14" y2="12"></line></svg>
                  <span>Equipamiento</span>
                </div>
                <p class="side-card-body">{{ ejercicio.material_necesario || 'Sin equipamiento especial' }}</p>
              </div>

              @if (ejercicio.evidencia_cientifica) {
                <div class="side-card science-card">
                  <div class="side-card-head science-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="side-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>Base Científica</span>
                  </div>
                  <p class="side-card-body science-body">{{ ejercicio.evidencia_cientifica }}</p>
                </div>
              }

              <div class="reviewer-card">
                <div class="reviewer-avatar">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="avatar-svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="reviewer-name">Revisión Clínica</div>
                  <div class="reviewer-role">Especialista Certificado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      max-width: 1100px;
      margin: var(--space-2) auto var(--space-8);
      background: var(--color-bg-card);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border);
    }

    .media-section {
      height: 480px;
      position: relative;
      background: #000;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      filter: brightness(0.85);
    }

    .overlay-controls {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
    }

    .back-btn-elegant {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--duration-base);
      &:hover { background: white; color: var(--color-text-primary); transform: translateX(-4px); }
    }
    .back-icon { width: 20px; height: 20px; }

    .video-placeholder {
      height: 100%;
      background: linear-gradient(135deg, #1A2B3E 0%, #00A781 100%);
    }

    .play-btn {
      width: 88px;
      height: 88px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--duration-slow) var(--easing-default);
      color: white;
      &:hover { transform: scale(1.1); background: white; color: var(--color-primary); }
    }
    .play-icon { width: 32px; height: 32px; margin-left: 4px; }

    .tracking-wide { letter-spacing: 2px; font-size: var(--text-xs); opacity: 0.8; }

    .detail-content { padding: var(--space-8); }

    .display-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-top: var(--space-1);
    }

    .badge-premium {
      background: var(--color-primary-low);
      color: var(--color-primary);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: 10px;
      font-weight: var(--font-bold);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .difficulty-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .difficulty-indicator {
      width: 10px;
      height: 10px;
      border-radius: var(--radius-pill);
      &.facil { background: var(--color-primary); }
      &.intermedio { background: var(--color-warning); }
      &.dificil { background: var(--color-danger); }
    }
    .difficulty-text { font-size: var(--text-xs); font-weight: var(--font-bold); color: var(--color-text-secondary); text-transform: uppercase; }

    .score-pill {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: var(--radius-pill);
      color: #92400e;
      font-weight: var(--font-bold);
    }
    .star-icon { width: 18px; height: 18px; }

    .info-section { margin-bottom: var(--space-6); }
    .section-label {
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--space-2);
    }

    .lead-text {
      font-size: var(--text-m);
      line-height: var(--leading-loose);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .instruction-box {
      background: var(--color-bg-app);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      border: 1px solid var(--color-border);
    }
    .instruction-inner {
      white-space: pre-wrap;
      line-height: var(--leading-loose);
      color: var(--color-text-primary);
      font-size: var(--text-m);
    }

    .side-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .side-card-head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
      font-size: var(--text-s);
    }
    .side-icon { width: 18px; height: 18px; color: var(--color-primary); }
    .side-card-body { font-size: var(--text-s); color: var(--color-text-secondary); margin: 0; }

    .science-card { background: var(--color-primary-low); border-color: var(--color-primary); }
    .science-head { color: var(--color-primary); }
    .science-body { color: var(--color-text-primary); }

    .reviewer-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--color-bg-app);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }
    .reviewer-avatar {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-pill);
      background: var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    }
    .avatar-svg { width: 24px; height: 24px; }
    .reviewer-name { font-weight: var(--font-bold); font-size: var(--text-s); color: var(--color-text-primary); }
    .reviewer-role { font-size: var(--text-xs); color: var(--color-text-muted); }

    @media (max-width: 992px) {
      .detail-content { padding: var(--space-5); }
      .media-section { height: 320px; }
    }
  `]
})
export class EjercicioPreviewComponent {
  private readonly location = inject(Location);

  @Input({ required: true }) ejercicio!: Ejercicio;

  goBack(): void {
    this.location.back();
  }
}
