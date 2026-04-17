export interface ValidacionEjercicio {
  id: string;
  ejercicio_id: string;
  revisor_id: string;
  revisor_nombre?: string;
  es_valido: boolean;
  comentario?: string;
  fecha_validacion: string;
}

export interface ValidacionFormData {
  es_valido: boolean;
  comentario?: string;
}
