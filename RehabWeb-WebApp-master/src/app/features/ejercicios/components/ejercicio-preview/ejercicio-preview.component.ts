import { Component, Input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  selector: 'app-ejercicio-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ejercicio-preview.component.html',
  styleUrl: './ejercicio-preview.component.scss',
})
export class EjercicioPreviewComponent {
  private readonly location = inject(Location);

  @Input({ required: true }) ejercicio!: Ejercicio;

  goBack(): void {
    this.location.back();
  }

  get dificultadClass(): string {
    return (this.ejercicio.dificultad ?? 'FACIL').toLowerCase();
  }

  get pasosProtocolo(): string[] {
    const raw = (this.ejercicio.instrucciones ?? '').trim();
    if (raw) {
      return raw
        .split(/\n+/)
        .map((l) => l.replace(/^\d+[\).\s-]+/, '').trim())
        .filter(Boolean);
    }
    const series = this.ejercicio.series ?? 3;
    const reps = this.ejercicio.reps || '10';
    return [
      'Colócate en la posición inicial indicada por tu terapeuta.',
      `Realiza ${reps} repeticiones controladas, manteniendo la respiración estable.`,
      `Descansa entre series. Objetivo: ${series} series en total.`,
      'Detén el ejercicio si aparece dolor agudo o mareo.',
    ];
  }

  get puntuacionMostrada(): string {
    const p = this.ejercicio.puntuacion_media;
    if (p && p > 0) return p.toFixed(1);
    return '—';
  }

  get tieneVideo(): boolean {
    return !!(this.ejercicio.video_url?.trim() || this.ejercicio.url_video?.trim());
  }

  get urlVideo(): string {
    return (this.ejercicio.video_url || this.ejercicio.url_video || '').trim();
  }
}
