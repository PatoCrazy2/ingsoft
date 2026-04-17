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
    <div class="preview-container shadow-premium" *ngIf="ejercicio">
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
            <h1 class="display-5 fw-bold text-dark mb-0">{{ ejercicio.nombre }}</h1>
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
              <p class="lead text-secondary lh-lg">{{ ejercicio.descripcion }}</p>
            </section>

            <section class="mb-5">
              <h3 class="detail-title">Instrucciones de ejecución</h3>
              <div class="steps-container">
                <div class="instruction-text p-4 rounded-4 bg-light border-start border-primary border-4">
                  {{ ejercicio.instrucciones }}
                </div>
              </div>
            </section>
          </div>

          <div class="col-lg-4">
            <div class="info-sidebar sticky-top" style="top: 2rem;">
              <div class="info-card mb-4 p-4 rounded-4 bg-white border">
                <h4 class="fw-bold mb-3 d-flex align-items-center">
                  <mat-icon class="me-2 text-primary">fitness_center</mat-icon> Equipamiento
                </h4>
                <p class="text-secondary mb-0">{{ ejercicio.material_necesario || 'Sin equipamiento especial' }}</p>
              </div>

              @if (ejercicio.evidencia_cientifica) {
                <div class="info-card science-card p-4 rounded-4">
                  <h4 class="fw-bold mb-3 d-flex align-items-center text-primary">
                    <mat-icon class="me-2">verified</mat-icon> Base Científica
                  </h4>
                  <p class="small text-secondary mb-0">{{ ejercicio.evidencia_cientifica }}</p>
                </div>
              }

              <div class="mt-4 p-3 d-flex align-items-center border rounded-4 bg-white">
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
      margin: 2rem auto 5rem;
      background: white;
      border-radius: 32px;
      overflow: hidden;
    }

    .shadow-premium {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
    }

    .media-section {
      height: 450px;
      position: relative;
      background: #0f172a;
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
      background: linear-gradient(45deg, #1e293b, #334155);
    }

    .play-btn {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #4f46e5; }
      &:hover { transform: scale(1.1); }
    }

    .overlay-controls {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
    }

    .detail-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    .badge-premium {
      background: #e0e7ff;
      color: #4338ca;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .difficulty-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      &.facil { background: #22c55e; }
      &.intermedio { background: #eab308; }
      &.dificil { background: #ef4444; }
    }

    .score-pill {
      background: #fffbeb;
      padding: 8px 16px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      border: 1px solid #fde68a;
    }

    .instruction-text {
      white-space: pre-wrap;
      line-height: 1.8;
      font-size: 1.1rem;
    }

    .science-card {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: #4f46e5;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .smaller { font-size: 0.75rem; }

    @media (max-width: 992px) {
      .detail-content { padding: 2rem !important; }
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
