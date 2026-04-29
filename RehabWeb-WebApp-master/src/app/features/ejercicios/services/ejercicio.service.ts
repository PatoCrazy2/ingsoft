import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import {
  MOCK_CATEGORIAS_EJERCICIO,
  MOCK_EJERCICIOS_ADMIN,
  MOCK_EJERCICIOS_PUBLICADOS,
  mockEjercicioPorId,
  mockEjerciciosPrefiltradosPorPaciente,
} from '../../../core/mock/clinical-mock.data';
import { API_BASE_URL, withApiBase } from '../../../core/http/api-base-url';
import { EjerciciosLocalesService } from '../../../core/storage/ejercicios-locales.service';
import { Ejercicio, EjercicioFormData, EstadoPublicacion } from '../models/ejercicio.model';
import { ValidacionEjercicio } from '../models/validacion.model';

/** Adapta la respuesta del modelo Django al shape usado por las tarjetas de la app. */
export function mapDjangoEjercicioToEjercicio(api: Record<string, unknown>): Ejercicio {
  const est = (api['estado_publicacion'] ?? api['estado']) as EstadoPublicacion | undefined;
  const now = new Date().toISOString();
  const creador = api['creador'];
  const creadorNombre = api['creador_nombre'];
  return {
    id: String(api['id'] ?? ''),
    nombre: String(api['nombre'] ?? ''),
    descripcion: String(api['descripcion'] ?? ''),
    instrucciones: '',
    material_necesario: '',
    categoria: String(api['categoria'] ?? 'GENERAL'),
    dificultad: 'FACIL',
    estado: est ?? 'PUBLICADO',
    es_personalizado: false,
    autor_id: creador != null ? String(creador) : '',
    creador_nombre:
      typeof creadorNombre === 'string' && creadorNombre.length > 0 ? creadorNombre : undefined,
    fecha_creacion: now,
    fecha_actualizacion: now,
    imagen_url: (api['thumbnail_url'] as string) || undefined,
    video_url: (api['url_video'] as string) || undefined,
    evidencia_cientifica: (api['evidencia_cientifica'] as string) || undefined,
    series: Number(api['series'] ?? 0),
    reps: String(api['repeticiones'] ?? ''),
  };
}

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {
  private http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly apiUrl = withApiBase(this.apiBase, '/api/ejercicios');
  private readonly ejLocales = inject(EjerciciosLocalesService);

  // Signals for state management
  ejercicios = signal<Ejercicio[]>([]);
  loading = signal<boolean>(false);

  /** Une respuesta API/mock con ejercicios guardados en `localStorage`. */
  private mergeEjerciciosLocales(
    base: Ejercicio[],
    filtros?: {
      estado?: EstadoPublicacion;
      pacienteId?: string;
      categoria?: string;
      estado_publicacion?: string;
    },
  ): Ejercicio[] {
    const locales = this.ejLocales.listar();
    if (!locales.length) {
      return base;
    }
    const estPub = filtros?.estado_publicacion ?? filtros?.estado;
    let extra = locales;
    if (estPub === 'PUBLICADO' || filtros?.estado === 'PUBLICADO' || filtros?.pacienteId) {
      extra = locales.filter((e) => e.estado === 'PUBLICADO');
    }
    if (filtros?.categoria) {
      extra = extra.filter((e) => e.categoria === filtros.categoria);
    }
    const ids = new Set(base.map((x) => x.id));
    const out = [...base];
    for (const x of extra) {
      if (!ids.has(x.id)) {
        out.push(x);
        ids.add(x.id);
      }
    }
    return out;
  }

  getEjercicios(filtros?: {
    estado?: EstadoPublicacion;
    pacienteId?: string;
    categoria?: string;
    estado_publicacion?: string;
  }): Observable<Ejercicio[]> {
    this.loading.set(true);
    let params = new HttpParams();
    const estPub = filtros?.estado_publicacion ?? filtros?.estado;
    if (estPub) {
      params = params.set('estado_publicacion', estPub);
    }
    if (filtros?.pacienteId) {
      params = params.set('paciente', filtros.pacienteId);
    }
    if (filtros?.categoria) {
      params = params.set('categoria', filtros.categoria);
    }

    const catalogoCompleto = !estPub && !filtros?.pacienteId && !filtros?.categoria;

    return this.http.get<unknown[]>(this.apiUrl + '/', { params }).pipe(
      map((rows) => {
        const mapped = (Array.isArray(rows) ? rows : []).map((r) =>
          mapDjangoEjercicioToEjercicio(r as Record<string, unknown>),
        );
        return this.mergeEjerciciosLocales(mapped, filtros);
      }),
      tap((data) => {
        // La biblioteca usa filtro PUBLICADO: no pisar el catálogo de admin (pendientes/borradores).
        if (catalogoCompleto) {
          this.ejercicios.set(data);
        }
      }),
      catchError((err) => {
        console.warn('[EjercicioService] API no disponible; usando catálogo mock.', err);
        let fallback: Ejercicio[];
        if (filtros?.pacienteId) {
          fallback = mockEjerciciosPrefiltradosPorPaciente(filtros.pacienteId);
        } else if (estPub === 'PUBLICADO' || filtros?.estado === 'PUBLICADO') {
          fallback = MOCK_EJERCICIOS_PUBLICADOS;
        } else {
          fallback = MOCK_EJERCICIOS_ADMIN;
        }
        if (filtros?.categoria) {
          fallback = fallback.filter((e) => e.categoria === filtros.categoria);
        }
        const merged = this.mergeEjerciciosLocales(fallback, filtros);
        if (catalogoCompleto) {
          this.ejercicios.set(merged);
        }
        return of(merged);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  /**
   * Lista solo ejercicios PUBLICADOS filtrados por perfil + evaluación del paciente (backend).
   */
  getEjerciciosPrefiltradosPorPaciente(pacienteId: string): Observable<Ejercicio[]> {
    const params = new HttpParams().set('paciente', pacienteId);
    return this.http.get<unknown[]>(`${this.apiUrl}/`, { params }).pipe(
      map((rows) => {
        const mapped = (Array.isArray(rows) ? rows : []).map((r) =>
          mapDjangoEjercicioToEjercicio(r as Record<string, unknown>),
        );
        return this.mergeEjerciciosLocales(mapped, {
          estado: 'PUBLICADO',
          estado_publicacion: 'PUBLICADO',
          pacienteId,
        });
      }),
      catchError(() => {
        console.warn('[EjercicioService] API no disponible; usando ejercicios mock por paciente.');
        const mock = mockEjerciciosPrefiltradosPorPaciente(pacienteId);
        return of(
          this.mergeEjerciciosLocales(mock, {
            estado: 'PUBLICADO',
            estado_publicacion: 'PUBLICADO',
            pacienteId,
          }),
        );
      }),
    );
  }

  getEjercicio(id: string): Observable<Ejercicio> {
    return this.http.get<Ejercicio>(`${this.apiUrl}/${id}/`).pipe(
      map((raw) => mapDjangoEjercicioToEjercicio(raw as unknown as Record<string, unknown>)),
      catchError(() => {
        const local = this.ejLocales.obtener(id);
        if (local) {
          return of(local);
        }
        console.warn('[EjercicioService] API no disponible; usando ejercicio mock id=', id);
        return of(mockEjercicioPorId(id));
      }),
    );
  }

  createEjercicio(data: EjercicioFormData): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(`${this.apiUrl}/`, data);
  }

  /** Payload alineado con Django `EjercicioCreateUpdateSerializer`. */
  crearEjercicioCatalogo(payload: Record<string, unknown>): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(`${this.apiUrl}/`, payload);
  }

  getCategoriasEjercicio(): Observable<{ codigo: string; nombre: string }[]> {
    return this.http.get<{ codigo: string; nombre: string }[]>(`${this.apiUrl}/categorias/`).pipe(
      catchError(() => of(MOCK_CATEGORIAS_EJERCICIO)),
    );
  }

  updateEjercicio(id: string, data: Partial<EjercicioFormData>): Observable<Ejercicio> {
    return this.http.patch<Ejercicio>(`${this.apiUrl}/${id}/`, data);
  }

  getPreview(id: string): Observable<Ejercicio> {
    return this.http.get<Ejercicio>(`${this.apiUrl}/${id}/preview/`);
  }

  validarEjercicio(id: string, validacion: { es_valido: boolean, comentario?: string }): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(`${this.apiUrl}/${id}/validar/`, validacion);
  }
}
