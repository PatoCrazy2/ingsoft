import { Injectable, signal } from '@angular/core';
import { Ejercicio } from '../../ejercicios/models/ejercicio.model';
import { PacienteDetalleDto, PacienteListItem } from './paciente';

/**
 * Estado de sesión para el flujo "Nueva rutina": paciente seleccionado y
 * resultados pre-filtrados (persistente mientras el servicio singleton viva).
 */
@Injectable({
  providedIn: 'root',
})
export class NuevaRutinaStateService {
  readonly pacienteSeleccionado = signal<PacienteListItem | PacienteDetalleDto | null>(null);
  readonly ejerciciosPrefiltrados = signal<Ejercicio[]>([]);
  readonly cargandoPacientes = signal(false);
  readonly cargandoEjercicios = signal(false);
  /** Fallo al cargar `/api/pacientes/` (red, credenciales, etc.). */
  readonly errorPacientes = signal<string | null>(null);
  /** Fallo al cargar ejercicios prefiltrados para el paciente elegido. */
  readonly errorEjercicios = signal<string | null>(null);
  /** 401 u otro fallo de autenticación al cargar pacientes. */
  readonly requiereInicioSesion = signal(false);

  limpiar(): void {
    this.pacienteSeleccionado.set(null);
    this.ejerciciosPrefiltrados.set([]);
    this.errorPacientes.set(null);
    this.errorEjercicios.set(null);
    this.requiereInicioSesion.set(false);
  }
}
