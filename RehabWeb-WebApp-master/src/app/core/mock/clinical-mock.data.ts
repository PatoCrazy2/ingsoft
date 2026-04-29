import { PacienteListItem } from '../../features/rutinas/services/paciente';
import { Ejercicio } from '../../features/ejercicios/models/ejercicio.model';

const now = () => new Date().toISOString();

/** Pacientes ficticios (misma forma que el API). */
export const MOCK_PACIENTES: PacienteListItem[] = [
  {
    paciente_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001',
    nombre_completo: 'María López (mock)',
    email: 'maria.mock@demo.rehab',
    estado: 'ACTIVO',
  },
  {
    paciente_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002',
    nombre_completo: 'Carlos Ruiz (mock)',
    email: 'carlos.mock@demo.rehab',
    estado: 'ACTIVO',
  },
  {
    paciente_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003',
    nombre_completo: 'Ana Martín (mock)',
    email: 'ana.mock@demo.rehab',
    estado: 'ACTIVO',
  },
];

function ej(
  id: string,
  nombre: string,
  descripcion: string,
  categoria: string,
  estado: Ejercicio['estado'],
  extra?: Partial<Ejercicio>,
): Ejercicio {
  return {
    id,
    nombre,
    descripcion,
    categoria,
    dificultad: 'INTERMEDIO',
    estado,
    instrucciones:
      '1. Prepara el entorno y comprueba dolor agudo.\n2. Ejecuta el movimiento con control y respiración.\n3. Descansa entre series según tolerancia.',
    material_necesario: 'Colchoneta o superficie estable (demo).',
    series: 3,
    reps: '10',
    fecha_creacion: now(),
    fecha_actualizacion: now(),
    creador_nombre: 'Terapeuta demo (mock)',
    imagen_url: 'https://picsum.photos/seed/rehab-' + id + '/400/240',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    evidencia_cientifica:
      'Datos de demostración locales. Sustituir por evidencia del API en entorno conectado.',
    ...extra,
  };
}

/** Catálogo publicado para biblioteca y pre-filtrado. */
export const MOCK_EJERCICIOS_PUBLICADOS: Ejercicio[] = [
  ej(
    'mock-pub-1',
    'Flexión controlada de rodilla',
    'Fortalecimiento cuádriceps con rango seguro post-ACV.',
    'MOVILIDAD',
    'PUBLICADO',
  ),
  ej(
    'mock-pub-2',
    'Equilibrio en tándem asistido',
    'Progresión suave para transferencias y marcha.',
    'EQUILIBRIO',
    'PUBLICADO',
  ),
  ej(
    'mock-pub-3',
    'Respiración diafragmática guiada',
    'Control ventilatorio y relajación del cinturón abdominal.',
    'POSTURAL',
    'PUBLICADO',
  ),
  ej(
    'mock-pub-4',
    'Alcance funcional en sedestación',
    'Movilidad de hombro con apoyo lumbar estable.',
    'FUERZA',
    'PUBLICADO',
  ),
  ej(
    'mock-pub-5',
    'Estabilización de tobillo en bipedestación',
    'Propiocepción y control neuromuscular distal.',
    'MOVILIDAD',
    'PUBLICADO',
  ),
];

/** Catálogo amplio para pantalla admin (incluye no publicados). */
export const MOCK_EJERCICIOS_ADMIN: Ejercicio[] = [
  ...MOCK_EJERCICIOS_PUBLICADOS,
  ej(
    'mock-bor-1',
    'Borrador — extensión de tronco',
    'Propuesta en revisión clínica.',
    'MOVILIDAD',
    'BORRADOR',
  ),
  ej(
    'mock-pen-1',
    'Pendiente de validación — marcha lateral',
    'Esperando segunda validación por pares.',
    'EQUILIBRIO',
    'PENDIENTE_VALIDACION',
  ),
];

export const MOCK_CATEGORIAS_EJERCICIO: { codigo: string; nombre: string }[] = [
  { codigo: 'FUERZA', nombre: 'Fuerza' },
  { codigo: 'MOVILIDAD', nombre: 'Movilidad' },
  { codigo: 'EQUILIBRIO', nombre: 'Equilibrio' },
  { codigo: 'POSTURAL', nombre: 'Higiene postural' },
  { codigo: 'GENERAL', nombre: 'General' },
];

/** Valores sugeridos en “Nuevo ejercicio” cuando no hay API. */
export const MOCK_EJERCICIO_NUEVO: Ejercicio = {
  id: 'mock-nuevo',
  nombre: 'Ejercicio de ejemplo (mock)',
  descripcion:
    'Descripción breve de demostración. Objetivo terapéutico y población diana para seguimiento en casa.',
  instrucciones:
    '1) Colócate en posición segura con apoyo.\n2) Realiza el movimiento lentamente sin dolor agudo.\n3) Mantén 5 s y relaja; repite según tolerancia.',
  material_necesario: 'Silla firme con banda elástica ligera y cronómetro',
  categoria: 'MOVILIDAD',
  dificultad: 'INTERMEDIO',
  estado: 'BORRADOR',
  video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  imagen_url: 'https://picsum.photos/seed/nuevo-ejercicio/640/360',
  evidencia_cientifica:
    'Texto de evidencia de ejemplo con más de cuarenta caracteres. Reemplazar por referencias reales al conectar el API.',
  series: 3,
  reps: '10',
  fecha_creacion: now(),
  fecha_actualizacion: now(),
};

export function mockEjerciciosPrefiltradosPorPaciente(_pacienteId: string): Ejercicio[] {
  return MOCK_EJERCICIOS_PUBLICADOS.slice(0, 4);
}

export function mockEjercicioPorId(id: string): Ejercicio {
  const all = [...MOCK_EJERCICIOS_ADMIN, MOCK_EJERCICIO_NUEVO];
  return all.find((e) => e.id === id) ?? { ...MOCK_EJERCICIO_NUEVO, id };
}
