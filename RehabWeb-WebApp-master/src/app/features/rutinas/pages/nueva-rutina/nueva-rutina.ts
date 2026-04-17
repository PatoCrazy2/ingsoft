import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
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
    MatIconModule,
    MatButtonModule,
    RouterLink,
    EjercicioCardComponent,
  ],
  templateUrl: './nueva-rutina.html',
  styleUrl: './nueva-rutina.scss',
})
export class NuevaRutinaPage implements OnInit {
  private readonly pacientesApi = inject(PacienteService);
  private readonly ejerciciosApi = inject(EjercicioService);
  private readonly destroyRef = inject(DestroyRef);
  readonly estado = inject(NuevaRutinaStateService);
  readonly auth = inject(AuthService);

  pacientes: PacienteListItem[] = [];
  pacienteIdSeleccion: string | null = null;

  constructor() {
    this.auth.sesionLista$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargarPacientes());
  }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.estado.cargandoPacientes.set(true);
    this.estado.errorMensaje.set(null);
    this.estado.requiereInicioSesion.set(false);
    this.pacientesApi.listar().subscribe({
      next: (lista) => {
        this.pacientes = lista;
        this.estado.cargandoPacientes.set(false);
        const prev = this.estado.pacienteSeleccionado();
        if (prev && 'paciente_id' in prev) {
          this.pacienteIdSeleccion = prev.paciente_id;
          this.alCambiarPaciente(this.pacienteIdSeleccion);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.estado.cargandoPacientes.set(false);
        this.pacientes = [];
        if (err.status === 401 || err.status === 403) {
          this.estado.requiereInicioSesion.set(true);
          this.estado.errorMensaje.set(null);
        } else {
          this.estado.requiereInicioSesion.set(false);
          this.estado.errorMensaje.set('No se pudo cargar el listado de pacientes.');
        }
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
    this.estado.errorMensaje.set(null);
    this.ejerciciosApi.getEjerciciosPrefiltradosPorPaciente(id).subscribe({
      next: (ej) => {
        this.estado.ejerciciosPrefiltrados.set(ej);
        this.estado.cargandoEjercicios.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.estado.cargandoEjercicios.set(false);
        this.estado.ejerciciosPrefiltrados.set([]);
        const body = err.error;
        let msg = 'No se pudieron cargar ejercicios para este paciente.';
        if (err.status === 401 || err.status === 403) {
          msg = 'Sesión no válida. Vuelve a iniciar sesión.';
          this.estado.requiereInicioSesion.set(true);
        }
        if (body?.paciente) {
          const v = body.paciente;
          msg = Array.isArray(v) ? v[0] : String(v);
        } else if (body?.detail) {
          msg = String(body.detail);
        }
        this.estado.errorMensaje.set(msg);
      },
    });
  }
}
