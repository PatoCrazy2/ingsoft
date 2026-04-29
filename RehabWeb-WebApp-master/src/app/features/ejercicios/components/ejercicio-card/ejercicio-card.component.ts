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
    RouterLink,
  ],
  template: `
    <mat-card class="ex-card">
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
        @if (ejercicio.creador_nombre) {
          <p class="ex-card__author">Por {{ ejercicio.creador_nombre }}</p>
        }
        <p class="ex-card__desc">{{ ejercicio.descripcion }}</p>

        <div class="ex-card__chips" aria-label="Parámetros del ejercicio">
          <span class="ex-chip">
            <span class="ex-chip__num">{{ ejercicio.series ?? 3 }}</span>
            <span class="ex-chip__lbl">series</span>
          </span>
          <span class="ex-chip">
            <span class="ex-chip__num">{{ ejercicio.reps || '12-15' }}</span>
            <span class="ex-chip__lbl">reps</span>
          </span>
        </div>
      </mat-card-content>

      <mat-card-actions class="ex-card__actions">
        <a mat-button color="primary" class="ex-card__cta" [routerLink]="['/ejercicios', ejercicio.id, 'preview']">
          Detalles
        </a>
      </mat-card-actions>
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
      transition: transform var(--duration-base) var(--easing-default), 
                  box-shadow var(--duration-base) var(--easing-default);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .ex-card__media {
      position: relative;
      height: 192px;
      overflow: hidden;
      background: var(--color-border);
    }

    .ex-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .ex-card__badge {
      position: absolute;
      top: var(--space-3);
      left: var(--space-3);
      padding: var(--space-1) var(--space-3);
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--color-primary);
      background: rgba(255, 255, 255, 0.9);
      border-radius: var(--radius-pill);
      box-shadow: var(--shadow-sm);
    }

    .ex-card__body {
      flex: 1;
      padding: var(--space-4) var(--space-4) var(--space-2);
    }

    .ex-card__title {
      margin: 0 0 var(--space-1);
      font-size: var(--text-m);
      font-weight: var(--font-bold);
      letter-spacing: var(--tracking-normal);
      color: var(--color-text-primary);
      line-height: var(--leading-tight);
    }

    .ex-card__author {
      margin: 0 0 var(--space-2);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      color: var(--color-text-secondary);
    }

    .ex-card__desc {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-s);
      line-height: var(--leading-default);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.65rem;
    }

    .ex-card__chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }

    .ex-chip {
      display: inline-flex;
      align-items: baseline;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-pill);
      border: 1px solid var(--color-border);
      background: var(--color-bg-app);
      font-size: var(--text-xs);
    }

    .ex-chip__num {
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
    }

    .ex-chip__lbl {
      color: var(--color-text-muted);
      font-weight: var(--font-medium);
    }

    .ex-card__actions {
      margin: 0;
      padding: var(--space-2) var(--space-3) var(--space-4);
      justify-content: flex-end;
    }

    .ex-card__cta {
      font-weight: var(--font-bold);
      letter-spacing: var(--tracking-wide);
      font-size: var(--text-xs);
      text-transform: uppercase;
      transition: color var(--duration-base) var(--easing-default);

      &:focus-visible {
        outline: 2px solid var(--color-focus-ring);
        outline-offset: 2px;
      }
    }
  `,
})
export class EjercicioCardComponent {
  @Input({ required: true }) ejercicio!: Ejercicio;

  get etiquetaCategoria(): string {
    return (this.ejercicio.categoria ?? 'Ejercicio').toUpperCase();
  }
}
