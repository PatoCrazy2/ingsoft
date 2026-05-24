import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioPreviewComponent } from '../../components/ejercicio-preview/ejercicio-preview.component';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, EjercicioPreviewComponent],
  templateUrl: './ejercicio-detail.component.html',
  styleUrl: './ejercicio-detail.component.scss',
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
        this.ejercicio.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        void this.router.navigate(['/ejercicios']);
      },
    });
  }
}
