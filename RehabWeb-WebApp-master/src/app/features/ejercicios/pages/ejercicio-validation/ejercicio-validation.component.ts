import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioPreviewComponent } from '../../components/ejercicio-preview/ejercicio-preview.component';
import { ValidacionPanelComponent } from '../../components/validacion-panel/validacion-panel.component';
import { Ejercicio } from '../../models/ejercicio.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidacionFormData } from '../../models/validacion.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, EjercicioPreviewComponent, ValidacionPanelComponent],
  templateUrl: './ejercicio-validation.component.html',
  styleUrl: './ejercicio-validation.component.scss',
})
export class EjercicioValidationPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(EjercicioService);
  private readonly snack = inject(MatSnackBar);

  readonly ejercicio = signal<Ejercicio | undefined>(undefined);
  readonly cargando = signal(true);
  readonly enviando = signal(false);

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
        this.snack.open('No se pudo cargar el ejercicio', 'Cerrar', { duration: 4000 });
      },
    });
  }

  onValidate(data: ValidacionFormData): void {
    const ej = this.ejercicio();
    if (!ej) return;

    this.enviando.set(true);
    this.service.validarEjercicio(ej.id, data).subscribe({
      next: () => {
        this.snack.open('Revisión registrada con éxito', 'OK', { duration: 3000 });
        void this.router.navigate(['/ejercicios/admin']);
      },
      error: () => {
        this.enviando.set(false);
        this.snack.open('Error al procesar la validación', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
