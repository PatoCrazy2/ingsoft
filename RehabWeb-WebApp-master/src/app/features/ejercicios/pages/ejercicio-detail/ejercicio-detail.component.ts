import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioPreviewComponent } from '../../components/ejercicio-preview/ejercicio-preview.component';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EjercicioPreviewComponent,
  ],
  template: `
    <div class="container py-4">
      @if (cargando()) {
        <div class="text-center py-5">
          <mat-spinner diameter="48"></mat-spinner>
          <p class="mt-3 text-secondary">Cargando ficha del ejercicio…</p>
        </div>
      } @else if (ejercicio()) {
        <app-ejercicio-preview [ejercicio]="ejercicio()!"></app-ejercicio-preview>
      } @else {
        <div class="detalle-fail rounded-4 p-4 border" role="alert">
          <p class="mb-3 text-secondary">No se encontró el ejercicio o no hay datos para mostrar.</p>
          <a mat-stroked-button color="primary" routerLink="/ejercicios">Volver a la biblioteca</a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .detalle-fail {
        max-width: 560px;
        margin: 2rem auto;
        background: #fffbeb;
        border-color: #fcd34d !important;
      }
    `,
  ],
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
        const instr =
          data.instrucciones?.trim() ||
          'Añade instrucciones paso a paso desde la edición del ejercicio. Mientras tanto, usa la descripción y la evidencia como guía.';
        this.ejercicio.set({
          ...data,
          instrucciones: instr,
          material_necesario:
            data.material_necesario?.trim() || 'Sin equipamiento especial indicado.',
        });
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        void this.router.navigate(['/ejercicios']);
      },
    });
  }
}
