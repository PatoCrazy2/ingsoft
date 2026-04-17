import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  selector: 'app-ejercicio-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    RouterLink
  ],
  template: `
    <mat-card class="ejercicio-card shadow-sm h-100">
      <div class="card-image-wrapper">
        <img mat-card-image [src]="ejercicio.imagen_url || 'assets/placeholder-exercise.jpg'" [alt]="ejercicio.nombre">
        <div class="category-tag">{{ ejercicio.categoria }}</div>
      </div>

      <mat-card-content class="pt-3">
        <h3 class="exercise-title mb-2">{{ ejercicio.nombre }}</h3>
        
        <p class="exercise-description">
          {{ ejercicio.descripcion }}
        </p>

        <div class="exercise-stats mt-3">
          <mat-chip-set aria-label="Ejercicio stats">
            <mat-chip class="stat-chip">
              <span class="fw-bold">{{ ejercicio.series || 3 }}</span> 
              <span class="text-secondary ms-1">series</span>
            </mat-chip>
            <mat-chip class="stat-chip">
              <span class="fw-bold">{{ ejercicio.reps || '12-15' }}</span> 
              <span class="text-secondary ms-1">reps</span>
            </mat-chip>
          </mat-chip-set>
        </div>
      </mat-card-content>

      <mat-card-actions align="end" class="pb-3 px-3">
        <button mat-button color="primary" [routerLink]="['/ejercicios', ejercicio.id, 'preview']">
          DETALLES
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .ejercicio-card {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #f0f0f0;
    }

    .ejercicio-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
    }

    .card-image-wrapper {
      position: relative;
      height: 180px;
      overflow: hidden;
    }

    .card-image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .category-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #1976d2;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .exercise-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .exercise-description {
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
      /* Truncado a 2 líneas */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 2.7rem; 
    }

    .stat-chip {
      --mdc-chip-container-height: 28px;
      --mdc-chip-label-text-size: 0.8rem;
      background-color: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
    }
  `]
})
export class EjercicioCardComponent {
  @Input({ required: true }) ejercicio!: Ejercicio;

  getDifficultyColor(dificultad: string): string {
    switch (dificultad) {
      case 'FACIL': return 'accent';
      case 'INTERMEDIO': return 'primary';
      case 'DIFICIL': return 'warn';
      default: return '';
    }
  }
}
