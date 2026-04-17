import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PacienteListItem {
  paciente_id: string;
  nombre_completo: string;
  email: string;
  estado: string;
}

export interface PerfilClinicoDto {
  id: string;
  diagnostico_principal: string;
  historial_medico: string;
  nivel_movilidad: string;
  restricciones: string;
  territorio_acv: string | null;
}

export interface EvaluacionPrioritariaDto {
  id: string;
  fecha_evaluacion: string;
  notas_evaluacion: string;
  metricas_objetivas: Record<string, unknown>;
  es_evaluacion_inicial: boolean;
  terapeuta_evaluador: string;
}

export interface PacienteDetalleDto extends PacienteListItem {
  fecha_nacimiento: string | null;
  perfil_clinico: PerfilClinicoDto | null;
  evaluacion_prioritaria: EvaluacionPrioritariaDto | null;
}

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/pacientes';

  listar(): Observable<PacienteListItem[]> {
    return this.http.get<PacienteListItem[]>(`${this.baseUrl}/`);
  }

  obtenerDetalle(pacienteId: string): Observable<PacienteDetalleDto> {
    return this.http.get<PacienteDetalleDto>(`${this.baseUrl}/${pacienteId}/`);
  }
}
