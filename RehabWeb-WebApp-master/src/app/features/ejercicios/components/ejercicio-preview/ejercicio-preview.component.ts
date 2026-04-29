import { Component, Input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Ejercicio } from '../../models/ejercicio.model';

/**
 * Vista mínima de ficha (detalle / validación). El diseño final lo definirá otro equipo.
 */
@Component({
  selector: 'app-ejercicio-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (ejercicio) {
      <article class="ej-preview">
        <p class="ej-preview__back">
          <button type="button" class="ej-preview__back-btn" (click)="goBack()">Volver</button>
        </p>

        <header class="ej-preview__head">
          <h1 class="ej-preview__title">{{ ejercicio.nombre }}</h1>
          <p class="ej-preview__meta">
            {{ ejercicio.categoria || '—' }} · {{ ejercicio.dificultad || '—' }}
            @if (ejercicio.estado) {
              <span> · {{ ejercicio.estado }}</span>
            }
          </p>
        </header>

        <section class="ej-preview__block">
          <h2 class="ej-preview__h2">Descripción</h2>
          <p class="ej-preview__p">{{ ejercicio.descripcion || '—' }}</p>
        </section>

        <section class="ej-preview__block">
          <h2 class="ej-preview__h2">Instrucciones</h2>
          <pre class="ej-preview__pre">{{ ejercicio.instrucciones || '—' }}</pre>
        </section>

        <section class="ej-preview__block">
          <h2 class="ej-preview__h2">Material</h2>
          <p class="ej-preview__p">{{ ejercicio.material_necesario || '—' }}</p>
        </section>

        @if (ejercicio.evidencia_cientifica?.trim()) {
          <section class="ej-preview__block">
            <h2 class="ej-preview__h2">Evidencia</h2>
            <p class="ej-preview__p">{{ ejercicio.evidencia_cientifica }}</p>
          </section>
        }

        @if (ejercicio.video_url?.trim() || ejercicio.imagen_url?.trim()) {
          <section class="ej-preview__block">
            <h2 class="ej-preview__h2">Enlaces</h2>
            <ul class="ej-preview__list">
              @if (ejercicio.video_url?.trim()) {
                <li>
                  <a [href]="ejercicio.video_url" target="_blank" rel="noopener noreferrer">Vídeo</a>
                </li>
              }
              @if (ejercicio.imagen_url?.trim()) {
                <li>
                  <a [href]="ejercicio.imagen_url" target="_blank" rel="noopener noreferrer">Imagen</a>
                </li>
              }
            </ul>
          </section>
        }
      </article>
    }
  `,
  styles: [
    `
      .ej-preview {
        max-width: 42rem;
        margin: 0 auto;
        padding: 1rem 0 2rem;
      }

      .ej-preview__back {
        margin: 0 0 1rem;
      }

      .ej-preview__back-btn {
        font: inherit;
        padding: 0;
        border: none;
        background: none;
        color: var(--primary-color, #1d4ed8);
        text-decoration: underline;
        cursor: pointer;
      }

      .ej-preview__back-btn:hover {
        color: var(--primary-hover, #1e40af);
      }

      .ej-preview__head {
        margin-bottom: 1.5rem;
      }

      .ej-preview__title {
        margin: 0 0 0.35rem;
        font-size: 1.35rem;
        font-weight: 600;
        line-height: 1.25;
        color: var(--rw-title, #0f172a);
      }

      .ej-preview__meta {
        margin: 0;
        font-size: 0.875rem;
        color: var(--rw-muted, #64748b);
      }

      .ej-preview__block {
        margin-bottom: 1.25rem;
      }

      .ej-preview__h2 {
        margin: 0 0 0.35rem;
        font-size: 0.8125rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--rw-muted, #64748b);
      }

      .ej-preview__p {
        margin: 0;
        font-size: 0.9375rem;
        line-height: 1.5;
        color: var(--rw-title, #0f172a);
      }

      .ej-preview__pre {
        margin: 0;
        font-family: inherit;
        font-size: 0.9375rem;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--rw-title, #0f172a);
      }

      .ej-preview__list {
        margin: 0;
        padding-left: 1.25rem;
        font-size: 0.9375rem;
      }
    `,
  ],
})
export class EjercicioPreviewComponent {
  private readonly location = inject(Location);

  @Input({ required: true }) ejercicio!: Ejercicio;

  goBack(): void {
    this.location.back();
  }
}
