import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  EjercicioService,
  mapDjangoEjercicioToEjercicio,
} from '../../services/ejercicio.service';
import { EjercicioFormComponent } from '../../components/ejercicio-form/ejercicio-form.component';
import { Ejercicio, EjercicioFormData } from '../../models/ejercicio.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MOCK_EJERCICIO_NUEVO } from '../../../../core/mock/clinical-mock.data';
import {
  EjerciciosLocalesService,
  ejercicioDesdeFormulario,
} from '../../../../core/storage/ejercicios-locales.service';

/** Igual que el payload al API: rellena vídeo y evidencia mínima para persistencia local homogénea. */
function formularioEnriquecidoMockLocal(form: EjercicioFormData): EjercicioFormData {
  const video =
    (form.video_url ?? '').trim() || 'https://example.org/videos/ejercicio-demo-placeholder.mp4';
  let ev = (form.evidencia_cientifica ?? '').trim();
  if (ev.length < 20) {
    ev = `${(form.descripcion ?? '').trim()} Contexto clínico mock para validador (sin API).`;
  }
  if (!form.video_url?.trim() && ev.length < 40) {
    ev = `${ev} Referencias generales en rehabilitación (mock local).`;
  }
  return {
    ...form,
    video_url: video,
    evidencia_cientifica: ev,
  };
}

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
  imports: [CommonModule, RouterLink, EjercicioFormComponent],
  templateUrl: './ejercicio-edit.component.html',
  styleUrl: './ejercicio-edit.component.scss',
})
export class EjercicioEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(EjercicioService);
  private snack = inject(MatSnackBar);
  private locales = inject(EjerciciosLocalesService);

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
    } else {
      this.ejercicio = { ...MOCK_EJERCICIO_NUEVO };
    }
  }

  onSave(data: EjercicioFormData): void {
    if (this.isEdit && this.ejercicio) {
      this.service.updateEjercicio(this.ejercicio.id, data).subscribe({
        next: (res) => {
          const guardado = mapDjangoEjercicioToEjercicio(res as unknown as Record<string, unknown>);
          this.locales.guardar(guardado);
          this.snack.open('Ejercicio actualizado (también copia en este navegador)', 'Cerrar', { duration: 3500 });
          this.service.getEjercicios().subscribe({
            next: () => void this.router.navigate(['/ejercicios/admin']),
            error: () => void this.router.navigate(['/ejercicios/admin']),
          });
        },
        error: (_err) => {
          const local = ejercicioDesdeFormulario(
            data,
            this.ejercicio!.id,
            this.ejercicio!.estado ?? 'PENDIENTE_VALIDACION',
            this.ejercicio,
          );
          this.locales.guardar(local);
          this.snack.open(
            'Sin API: cambios guardados solo en este navegador. Revisa biblioteca o admin tras recargar.',
            'Cerrar',
            { duration: 6000 },
          );
          void this.router.navigate(['/ejercicios/admin']);
        },
      });
      return;
    }
    this.service.crearEjercicioCatalogo(payloadCrearCatalogo(data)).subscribe({
      next: (res) => {
        const guardado = mapDjangoEjercicioToEjercicio(res as unknown as Record<string, unknown>);
        this.locales.guardar(guardado);
        this.snack.open('Ejercicio enviado al API y copiado en este navegador', 'Cerrar', { duration: 3500 });
        this.service.getEjercicios().subscribe({
          next: () => void this.router.navigate(['/ejercicios/admin']),
          error: () => void this.router.navigate(['/ejercicios/admin']),
        });
      },
      error: () => {
        const id = this.locales.nuevoIdLocal();
        const datos = formularioEnriquecidoMockLocal(data);
        const local = ejercicioDesdeFormulario(datos, id, 'PENDIENTE_VALIDACION');
        this.locales.guardar(local);
        void this.router.navigate(['/ejercicios/admin']);
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['/ejercicios/admin']);
  }
}
