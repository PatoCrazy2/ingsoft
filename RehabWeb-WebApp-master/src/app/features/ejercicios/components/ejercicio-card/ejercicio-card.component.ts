import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  selector: 'app-ejercicio-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterLink,
  ],
  template: `
    <mat-card class="ex-card animate-in">
      <div class="ex-card__media">
        <img
          class="ex-card__img"
          [src]="ejercicio.imagen_url || 'assets/placeholder-exercise.jpg'"
          [alt]="ejercicio.nombre"
          loading="lazy"
        />
        <span class="ex-card__badge">{{ etiquetaCategoria }}</span>
      </div>

      <mat-card-content class="ex-card__body">
        <h3 class="ex-card__title">{{ ejercicio.nombre }}</h3>
        <p class="ex-card__desc">{{ ejercicio.descripcion }}</p>

        <div class="ex-card__chips">
          <div class="ex-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.42 4.58a10 10 0 1 1-14.42 0"></path><polyline points="12 2 12 12"></polyline></svg>
            <span class="ex-chip__num">{{ ejercicio.series ?? 3 }}</span>
            <span class="ex-chip__lbl">series</span>
          </div>
          <div class="ex-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span class="ex-chip__num">{{ ejercicio.reps || '12-15' }}</span>
            <span class="ex-chip__lbl">reps</span>
          </div>
        </div>
      </mat-card-content>

      <div class="ex-card__footer">
        <a [routerLink]="['/ejercicios', ejercicio.id, 'detalle']" class="btn-card-premium">
          Ver Detalles
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>
    </mat-card>
  `,
  styles: `
    .ex-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--color-border);
      background: var(--color-bg-card);
      box-shadow: var(--shadow-sm);
      transition: all var(--duration-base) var(--easing-default);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-primary);
      }
    }

    .ex-card__media {
      position: relative;
      height: 180px;
      overflow: hidden;
      background: #f1f5f9;
    }

    .ex-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--duration-slow);
    }
    .ex-card:hover .ex-card__img { transform: scale(1.05); }

    .ex-card__badge {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      padding: 4px 10px;
      font-size: 10px;
      font-weight: var(--font-bold);
      text-transform: uppercase;
      color: white;
      background: var(--color-primary);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
    }

    .ex-card__body {
      flex: 1;
      padding: var(--space-4);
    }

    .ex-card__title {
      margin: 0 0 var(--space-1);
      font-size: var(--text-m);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
    }

    .ex-card__desc {
      margin: 0 0 var(--space-4);
      color: var(--color-text-secondary);
      font-size: var(--text-s);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: var(--leading-default);
    }

    .ex-card__chips {
      display: flex;
      gap: var(--space-2);
    }

    .ex-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 2px 8px;
      background: var(--color-bg-app);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      border: 1px solid var(--color-border);
    }
    .chip-icon { width: 12px; height: 12px; }

    .ex-chip__num { font-weight: var(--font-bold); color: var(--color-text-primary); }

    .ex-card__footer {
      padding: var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    .btn-card-premium {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      color: var(--color-primary);
      font-weight: var(--font-bold);
      font-size: var(--text-s);
      text-decoration: none;
      transition: all var(--duration-base);
      &:hover { gap: var(--space-3); }
    }
    .btn-icon { width: 16px; height: 16px; }
  `,
})
export class EjercicioCardComponent {
  @Input({ required: true }) ejercicio!: Ejercicio;

  get etiquetaCategoria(): string {
    return (this.ejercicio.categoria ?? 'Ejercicio').toUpperCase();
  }
}
