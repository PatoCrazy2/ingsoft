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
      border-radius: 18px !important;
      overflow: hidden;
      border: 1px solid var(--rw-border) !important;
      background: var(--rw-surface) !important;
      box-shadow: var(--card-shadow) !important;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .ex-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--premium-shadow) !important;
    }

    .ex-card__media {
      position: relative;
      height: 192px;
      overflow: hidden;
      background: #e2e8f0;
    }

    .ex-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .ex-card__badge {
      position: absolute;
      top: 14px;
      left: 14px;
      padding: 6px 14px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #1d4ed8;
      background: rgba(255, 255, 255, 0.94);
      border-radius: 999px;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
    }

    .ex-card__body {
      flex: 1;
      padding: 1.1rem 1.15rem 0.5rem !important;
    }

    .ex-card__title {
      margin: 0 0 0.35rem;
      font-size: 1.08rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0f172a;
      line-height: 1.3;
    }

    .ex-card__author {
      margin: 0 0 0.45rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
    }

    .ex-card__desc {
      margin: 0;
      color: var(--rw-muted);
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.65rem;
    }

    .ex-card__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .ex-chip {
      display: inline-flex;
      align-items: baseline;
      gap: 0.25rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      border: 1px solid var(--rw-border);
      background: #f8fafc;
      font-size: 0.78rem;
    }

    .ex-chip__num {
      font-weight: 700;
      color: var(--rw-title);
    }

    .ex-chip__lbl {
      color: var(--rw-muted);
      font-weight: 500;
    }

    .ex-card__actions {
      margin: 0 !important;
      padding: 0.35rem 0.75rem 1rem !important;
      justify-content: flex-end;
    }

    .ex-card__cta {
      font-weight: 700 !important;
      letter-spacing: 0.06em;
      font-size: 0.72rem !important;
      text-transform: uppercase !important;
    }
  `,
})
export class EjercicioCardComponent {
  @Input({ required: true }) ejercicio!: Ejercicio;

  get etiquetaCategoria(): string {
    return (this.ejercicio.categoria ?? 'Ejercicio').toUpperCase();
  }
}
