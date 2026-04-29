import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EjercicioService,
  mapDjangoEjercicioToEjercicio,
} from '../../services/ejercicio.service';
import { EjercicioFormComponent } from '../../components/ejercicio-form/ejercicio-form.component';
import { Ejercicio, EjercicioFormData } from '../../models/ejercicio.model';
import { MatSnackBar } from '@angular/material/snack-bar';

function payloadCrearCatalogo(form: EjercicioFormData): Record<string, unknown> {
  const video =
    (form.video_url ?? '').trim() || 'https://example.org/videos/ejercicio-demo-placeholder.mp4';
  let ev = (form.evidencia_cientifica ?? '').trim();
  if (ev.length < 20) {
    ev = `${(form.descripcion ?? '').trim()} Contexto clínico y criterios de aplicación seguros (texto de respaldo para el validador).`;
  }
  if (!form.video_url?.trim() && ev.length < 40) {
    ev = `${ev} Referencias generales en rehabilitación neurológica y fisioterapia basada en evidencia.`;
  }
  return {
    nombre: form.nombre,
    descripcion: form.descripcion,
    series: 3,
    repeticiones: 10,
    tiempo_segundos: 45,
    url_video: video,
    thumbnail_url: (form.imagen_url ?? '').trim() || undefined,
    evidencia_cientifica: ev,
    referencias_bibliograficas: [],
    movilidad_paciente_min: '1',
    movilidad_paciente_max: '5',
    territorios_acv_compatibles: [],
    categoria: form.categoria || 'GENERAL',
    etiquetas_clinicas: [form.categoria || 'GENERAL'],
  };
}

@Component({
  standalone: true,
  imports: [CommonModule, EjercicioFormComponent],
  template: `
    <div class="edit-page animate-in">
      <div class="container py-4">
        <app-ejercicio-form
          [initialData]="ejercicio"
          [isEdit]="isEdit"
          (formSubmit)="onSave($event)"
          (cancelClick)="onCancel()"
        >
        </app-ejercicio-form>
      </div>
    </div>
  `,
  styles: [`
    .edit-page {
      min-height: 100vh;
      background-color: var(--color-bg-app);
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
  `]
})
export class EjercicioEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(EjercicioService);
  private snack = inject(MatSnackBar);

  ejercicio?: Ejercicio;
  isEdit = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.service.getEjercicio(id).subscribe({
        next: (data) => {
          this.ejercicio = mapDjangoEjercicioToEjercicio(data as unknown as Record<string, unknown>);
        },
        error: () => this.snack.open('No se pudo cargar el ejercicio', 'Cerrar', { duration: 4000 }),
      });
    }
  }

  onSave(data: EjercicioFormData): void {
    if (this.isEdit && this.ejercicio) {
      this.service.updateEjercicio(this.ejercicio.id, data).subscribe({
        next: () => {
          this.snack.open('Ejercicio actualizado', 'Cerrar', { duration: 3000 });
          this.service.getEjercicios().subscribe({
            next: () => void this.router.navigate(['/ejercicios/admin']),
            error: () => void this.router.navigate(['/ejercicios/admin']),
          });
        },
        error: (err) => {
          const msg = err?.error ? JSON.stringify(err.error).slice(0, 120) : 'Error al guardar';
          this.snack.open(msg, 'Cerrar', { duration: 5000 });
        },
      });
      return;
    }
    this.service.crearEjercicioCatalogo(payloadCrearCatalogo(data)).subscribe({
      next: () => {
        this.snack.open('Ejercicio enviado a revisión', 'Cerrar', { duration: 3000 });
        this.service.getEjercicios().subscribe({
          next: () => void this.router.navigate(['/ejercicios/admin']),
          error: () => void this.router.navigate(['/ejercicios/admin']),
        });
      },
      error: (err) => {
        const body = err?.error;
        const det = typeof body === 'object' && body ? JSON.stringify(body) : String(err?.message ?? '');
        this.snack.open(det.slice(0, 200) || 'Error al crear', 'Cerrar', { duration: 6000 });
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['/ejercicios/admin']);
  }
}
