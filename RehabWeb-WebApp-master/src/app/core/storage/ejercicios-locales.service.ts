import { Injectable } from '@angular/core';
import { Ejercicio, EjercicioFormData, EstadoPublicacion } from '../../features/ejercicios/models/ejercicio.model';

const STORAGE_KEY = 'rehabweb_ejercicios_locales_v1';

function ahora(): string {
  return new Date().toISOString();
}

/** Construye un `Ejercicio` persistible a partir del formulario (sin API). */
export function ejercicioDesdeFormulario(
  form: EjercicioFormData,
  id: string,
  estado: EstadoPublicacion,
  prev?: Partial<Ejercicio>,
): Ejercicio {
  const base: Ejercicio = {
    id,
    nombre: form.nombre,
    descripcion: form.descripcion,
    instrucciones: form.instrucciones,
    material_necesario: form.material_necesario,
    categoria: form.categoria || 'GENERAL',
    dificultad: form.dificultad,
    estado,
    video_url: form.video_url?.trim() || undefined,
    imagen_url: form.imagen_url?.trim() || undefined,
    evidencia_cientifica: form.evidencia_cientifica?.trim() || undefined,
    series: prev?.series ?? 3,
    reps: prev?.reps ?? '10',
    fecha_creacion: prev?.fecha_creacion ?? ahora(),
    fecha_actualizacion: ahora(),
    creador_nombre: 'Guardado en este navegador',
    es_personalizado: true,
  };
  return { ...prev, ...base };
}

@Injectable({ providedIn: 'root' })
export class EjerciciosLocalesService {
  /** Lista todos los ejercicios guardados solo en el cliente. */
  listar(): Ejercicio[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((x): x is Ejercicio => x != null && typeof (x as Ejercicio).id === 'string');
    } catch {
      return [];
    }
  }

  guardar(ej: Ejercicio): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const actuales = this.listar();
    const idx = actuales.findIndex((e) => e.id === ej.id);
    const siguiente = idx >= 0 ? [...actuales.slice(0, idx), ej, ...actuales.slice(idx + 1)] : [...actuales, ej];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siguiente));
  }

  obtener(id: string): Ejercicio | undefined {
    return this.listar().find((e) => e.id === id);
  }

  eliminar(id: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const siguiente = this.listar().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siguiente));
  }

  nuevoIdLocal(): string {
    return `local-${crypto.randomUUID()}`;
  }
}
