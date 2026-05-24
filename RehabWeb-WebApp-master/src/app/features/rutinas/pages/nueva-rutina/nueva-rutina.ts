import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../../core/auth/auth.service';
import { EjercicioCardComponent } from '../../../ejercicios/components/ejercicio-card/ejercicio-card.component';
import { EjercicioService } from '../../../ejercicios/services/ejercicio.service';
import { NuevaRutinaStateService } from '../../services/nueva-rutina-state';
import { PacienteListItem, PacienteService } from '../../services/paciente';

@Component({
  selector: 'app-nueva-rutina',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    EjercicioCardComponent,
  ],
  templateUrl: './nueva-rutina.html',
  styleUrl: './nueva-rutina.scss',
})
export class NuevaRutinaPage {
  private readonly auth = inject(AuthService);
  private readonly pacientesApi = inject(PacienteService);
  private readonly ejerciciosApi = inject(EjercicioService);
  private readonly destroyRef = inject(DestroyRef);
  readonly estado = inject(NuevaRutinaStateService);

  pacientes: PacienteListItem[] = [];
  pacienteIdSeleccion: string | null = null;

  constructor() {
    afterNextRender(() => this._cargarPacientesTrasSesion());
  }

  cargarPacientes(): void {
    this._cargarPacientesTrasSesion();
  }

  private async _cargarPacientesTrasSesion(): Promise<void> {
    await this.auth.asegurarSesion();
    const rol = this.auth.role();
    if (rol !== 'Terapeuta' && rol !== 'Admin') {
      await this.auth.loginByRole('Terapeuta');
    }

    this.estado.cargandoPacientes.set(true);
    this.estado.errorPacientes.set(null);
    this.estado.errorEjercicios.set(null);
    this.estado.requiereInicioSesion.set(false);

    this.pacientesApi
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.pacientes = lista;
          this.estado.cargandoPacientes.set(false);
          this.estado.errorPacientes.set(null);
          const prev = this.estado.pacienteSeleccionado();
          if (prev?.paciente_id) {
            this.pacienteIdSeleccion = prev.paciente_id;
            this.alCambiarPaciente(this.pacienteIdSeleccion);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.estado.cargandoPacientes.set(false);
          this.pacientes = [];
          if (err.status === 401 || err.status === 403) {
            this.estado.requiereInicioSesion.set(true);
            this.estado.errorPacientes.set(
              'Sesión no válida para listar pacientes. Inicia sesión como Terapeuta o Administrador.',
            );
            return;
          }
          this.estado.errorPacientes.set(
            'No se pudo cargar el listado de pacientes. Comprueba que el backend esté en ejecución.',
          );
        },
      });
  }

  alCambiarPaciente(id: string | null): void {
    const pacienteId = id && String(id).trim() ? String(id) : null;
    this.pacienteIdSeleccion = pacienteId;
    if (!pacienteId) {
      this.estado.pacienteSeleccionado.set(null);
      this.estado.ejerciciosPrefiltrados.set([]);
      this.estado.recomendacionesClinicas.set([]);
      return;
    }

    this.estado.cargandoEjercicios.set(true);
    this.estado.errorEjercicios.set(null);

    this.pacientesApi
      .obtenerDetalle(pacienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (paciente) => {
          this.estado.pacienteSeleccionado.set(paciente);

          this.ejerciciosApi
            .getEjerciciosPrefiltradosPorPaciente(pacienteId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (ejercicios) => {
                const sugeridos = this.ejerciciosApi.getRecomendacionesClinicas(
                  paciente,
                  ejercicios,
                );
                this.estado.recomendacionesClinicas.set(sugeridos);
                this.estado.ejerciciosPrefiltrados.set(ejercicios);
                this.estado.cargandoEjercicios.set(false);
              },
              error: () => {
                this.estado.cargandoEjercicios.set(false);
                this.estado.errorEjercicios.set(
                  'Error al cargar ejercicios sugeridos para este paciente.',
                );
              },
            });
        },
        error: () => {
          this.estado.cargandoEjercicios.set(false);
          this.estado.errorEjercicios.set(
            'Error al obtener el perfil clínico del paciente seleccionado.',
          );
        },
      });
  }
}
