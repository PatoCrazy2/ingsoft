import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
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
    MatIconModule,
    MatButtonModule,
    RouterLink,
    EjercicioCardComponent,
  ],
  templateUrl: './nueva-rutina.html',
  styleUrl: './nueva-rutina.scss',
})
export class NuevaRutinaPage {
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

  private _cargarPacientesTrasSesion(): void {
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
          if (prev && 'paciente_id' in prev) {
            this.pacienteIdSeleccion = prev.paciente_id;
            this.alCambiarPaciente(this.pacienteIdSeleccion);
          }
        },
        error: () => {
          this.estado.cargandoPacientes.set(false);
          this.pacientes = [];
          this.estado.requiereInicioSesion.set(false);
          this.estado.errorPacientes.set(
            'No se pudo cargar el listado de pacientes. El servicio debería devolver datos mock si el fallo es de red; si ves este mensaje, revisa la consola del navegador.',
          );
        },
      });
  }

  alCambiarPaciente(id: string | null): void {
    this.pacienteIdSeleccion = id;
    if (!id) {
      this.estado.pacienteSeleccionado.set(null);
      this.estado.ejerciciosPrefiltrados.set([]);
      return;
    }
    const p = this.pacientes.find((x) => x.paciente_id === id) ?? null;
    this.estado.pacienteSeleccionado.set(p);
    this.estado.cargandoEjercicios.set(true);
    this.estado.errorEjercicios.set(null);
    this.ejerciciosApi.getEjerciciosPrefiltradosPorPaciente(id).subscribe({
      next: (ej) => {
        this.estado.ejerciciosPrefiltrados.set(ej);
        this.estado.cargandoEjercicios.set(false);
        this.estado.errorEjercicios.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.estado.cargandoEjercicios.set(false);
        this.estado.ejerciciosPrefiltrados.set([]);
        const body = err.error;
        let msg = 'No se pudieron cargar ejercicios para este paciente.';
        if (body?.paciente) {
          const v = body.paciente;
          msg = Array.isArray(v) ? v[0] : String(v);
        } else if (body?.detail) {
          msg = String(body.detail);
        }
        this.estado.errorEjercicios.set(msg);
      },
    });
  }
}
