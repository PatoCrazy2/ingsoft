import { Component, Input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  selector: 'app-ejercicio-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule, MatChipsModule, MatButtonModule],
  template: `
    <div class="preview-container animate-in" *ngIf="ejercicio">
      <div class="media-section">
        <div class="overlay-controls p-4">
           <button mat-mini-fab color="white" class="back-btn" (click)="goBack()">
             <mat-icon>arrow_back</mat-icon>
           </button>
        </div>
        
        <ng-container *ngIf="ejercicio.video_url; else imageSection">
           <div class="video-placeholder d-flex align-items-center justify-content-center">
              <div class="play-btn">
                <mat-icon>play_arrow</mat-icon>
              </div>
              <p class="ms-3 text-white fw-bold mb-0">REPRODUCIR VIDEO INSTRUCTIVO</p>
           </div>
        </ng-container>
        <ng-template #imageSection>
          <div class="hero-image" [style.backgroundImage]="'url(' + (ejercicio.imagen_url || 'assets/placeholder-exercise.jpg') + ')'"></div>
        </ng-template>
      </div>

      <div class="detail-content p-5">
        <div class="header-row d-flex justify-content-between align-items-start mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge-premium">{{ ejercicio.categoria }}</span>
              <span class="difficulty-indicator" [ngClass]="(ejercicio.dificultad ?? 'FACIL').toLowerCase()"></span>
              <span class="small text-secondary fw-bold">{{ ejercicio.dificultad }}</span>
            </div>
            <h1 class="display-title">{{ ejercicio.nombre }}</h1>
          </div>
          <div class="score-pill">
            <mat-icon color="warn">star</mat-icon>
            <span>{{ ejercicio.puntuacion_media || '5.0' }}</span>
          </div>
        </div>

        <div class="row g-5">
          <div class="col-lg-8">
            <section class="mb-5">
              <h3 class="detail-title">Sobre este ejercicio</h3>
              <p class="lead-text">{{ ejercicio.descripcion }}</p>
            </section>

            <section class="mb-5">
              <h3 class="detail-title">Instrucciones de ejecución</h3>
              <div class="steps-container">
                <div class="instruction-text">
                  {{ ejercicio.instrucciones }}
                </div>
              </div>
            </section>
          </div>

          <div class="col-lg-4">
            <div class="info-sidebar sticky-top" style="top: 2rem;">
              <div class="info-card">
                <h4 class="info-card-title">
                  <mat-icon class="me-2 text-primary">fitness_center</mat-icon> Equipamiento
                </h4>
                <p class="info-card-text">{{ ejercicio.material_necesario || 'Sin equipamiento especial' }}</p>
              </div>

              @if (ejercicio.evidencia_cientifica) {
                <div class="info-card science-card">
                  <h4 class="info-card-title science-title">
                    <mat-icon class="me-2">verified</mat-icon> Base Científica
                  </h4>
                  <p class="info-card-text science-text">{{ ejercicio.evidencia_cientifica }}</p>
                </div>
              }

              <div class="mt-4 p-3 d-flex align-items-center border-box">
                <div class="avatar me-3">J</div>
                <div>
                  <div class="fw-bold small">Revisado por</div>
                  <div class="text-secondary smaller">Especialista en Rehabilitación</div>
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
      margin: var(--space-5) auto var(--space-8);
      background: var(--color-bg-card);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .media-section {
      height: 450px;
      position: relative;
      background: var(--color-text-primary);
    }

    .hero-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      filter: brightness(0.8);
    }

    .video-placeholder {
      height: 100%;
      background: linear-gradient(45deg, var(--color-text-primary), var(--color-text-secondary));
    }

    .play-btn {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform var(--duration-base) var(--easing-default);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--color-primary); }
      &:hover { transform: scale(1.1); }
      &:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
    }

    .overlay-controls {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
    }

    .detail-content {
      padding: var(--space-7);
    }

    .display-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-bottom: 0;
      line-height: var(--leading-tight);
    }

    .detail-title {
      font-size: var(--text-l);
      font-weight: var(--font-bold);
      margin-bottom: var(--space-4);
      color: var(--color-text-primary);
    }

    .lead-text {
      font-size: var(--text-m);
      line-height: var(--leading-default);
      color: var(--color-text-secondary);
    }

    .badge-premium {
      background: var(--color-primary-low);
      color: var(--color-primary);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      text-transform: uppercase;
    }

    .difficulty-indicator {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-pill);
      &.facil { background: var(--color-primary); }
      &.intermedio { background: var(--color-warning); }
      &.dificil { background: var(--color-danger); }
    }

    .score-pill {
      background: #fffbeb;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-weight: var(--font-bold);
      border: 1px solid var(--color-warning);
    }

    .instruction-text {
      white-space: pre-wrap;
      line-height: var(--leading-loose);
      font-size: var(--text-m);
      background: var(--color-bg-app);
      border-left: 4px solid var(--color-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .info-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .info-card-title {
      font-size: var(--text-m);
      font-weight: var(--font-bold);
      margin-bottom: var(--space-3);
      display: flex;
      align-items: center;
    }

    .info-card-text {
      font-size: var(--text-s);
      color: var(--color-text-secondary);
      margin-bottom: 0;
    }

    .science-card {
      background: var(--color-primary-low);
      border-color: var(--color-primary);
    }

    .science-title {
      color: var(--color-primary);
    }

    .border-box {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-bg-card);
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: var(--color-primary);
      color: white;
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-bold);
    }

    .smaller { font-size: var(--text-xs); }

    @media (max-width: 992px) {
      .detail-content { padding: var(--space-5); }
      .media-section { height: 300px; }
    }
  `]
})
export class EjercicioPreviewComponent {
  private location = inject(Location);
  @Input({ required: true }) ejercicio!: Ejercicio;

  goBack(): void {
    this.location.back();
  }
}
