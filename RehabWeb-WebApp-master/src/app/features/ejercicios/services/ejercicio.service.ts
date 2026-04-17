import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Ejercicio, EjercicioFormData, EstadoPublicacion } from '../models/ejercicio.model';
import { ValidacionEjercicio } from '../models/validacion.model';

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {
  private http = inject(HttpClient);
  private apiUrl = '/api/ejercicios'; // Ajustar según backend

  // Signals for state management
  ejercicios = signal<Ejercicio[]>([]);
  loading = signal<boolean>(false);

  getEjercicios(filtros?: { estado?: EstadoPublicacion }): Observable<Ejercicio[]> {
    this.loading.set(true);
    let params = new HttpParams();
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<Ejercicio[]>(this.apiUrl, { params }).pipe(
      tap(data => {
        this.ejercicios.set(data);
        this.loading.set(false);
      }),
      // Fallback a Mocks en caso de error para desarrollo
      catchError(err => {
        console.warn('Usando mocks por error en el back:', err);
        const mocks: Ejercicio[] = [
          {
            id: '1',
            nombre: 'Flexión de Rodilla con Banda',
            descripcion: 'Ejercicio para fortalecer cuádriceps y movilidad de rodilla.',
            instrucciones: '1. Siéntate.\n2. Coloca la banda.\n3. Extiende la pierna.',
            material_necesario: 'Banda elástica',
            categoria: 'MOVILIDAD',
            dificultad: 'FACIL',
            estado: 'PUBLICADO',
            evidencia_cientifica: 'Estudio de rehabilitación 2023',
            es_personalizado: false,
            autor_id: 'admin',
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
            imagen_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400'
          },
          {
            id: '2',
            nombre: 'Sentadilla Isométrica',
            descripcion: 'Fortalecimiento estático contra la pared.',
            instrucciones: 'Apóyate en la pared y aguanta 30 segundos.',
            material_necesario: 'Pared',
            categoria: 'FUERZA',
            dificultad: 'INTERMEDIO',
            estado: 'PENDIENTE_VALIDACION',
            es_personalizado: false,
            autor_id: 'admin',
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
            imagen_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400'
          }
        ];
        
        const filtered = filtros?.estado 
          ? mocks.filter(m => m.estado === filtros.estado) 
          : mocks;
          
        this.ejercicios.set(filtered);
        this.loading.set(false);
        return of(filtered);
      })
    );
  }

  getEjercicio(id: string): Observable<Ejercicio> {
    return this.http.get<Ejercicio>(`${this.apiUrl}/${id}/`);
  }

  createEjercicio(data: EjercicioFormData): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(this.apiUrl, data);
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
