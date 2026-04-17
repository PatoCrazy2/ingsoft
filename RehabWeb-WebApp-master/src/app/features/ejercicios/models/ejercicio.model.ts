export type EstadoPublicacion = 'BORRADOR' | 'PENDIENTE_VALIDACION' | 'PUBLICADO';

export interface Ejercicio {
  id: string;
  nombre: string;
  descripcion: string;
  instrucciones: string;
  material_necesario: string;
  video_url?: string;
  imagen_url?: string;
  categoria: string;
  dificultad: 'FACIL' | 'INTERMEDIO' | 'DIFICIL';
  estado: EstadoPublicacion;
  evidencia_cientifica?: string;
  es_personalizado: boolean;
  autor_id: string;
  puntuacion_media?: number;
  total_valoraciones?: number;
  series?: number;
  reps?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EjercicioFormData {
  nombre: string;
  descripcion: string;
  instrucciones: string;
  material_necesario: string;
  video_url?: string;
  imagen_url?: string;
  categoria: string;
  dificultad: 'FACIL' | 'INTERMEDIO' | 'DIFICIL';
  evidencia_cientifica?: string;
  estado?: EstadoPublicacion;
}
