"""
Lógica de pre-filtrado clínico: perfil (RF-CLIN-001) + evaluación (RF-CLIN-002).
"""
from __future__ import annotations

from typing import TYPE_CHECKING, Iterable, Optional

from .models import TerritorioACV

if TYPE_CHECKING:
    from .models import Ejercicio, Paciente


def _nivel_a_int(valor: Optional[str]) -> Optional[int]:
    if valor is None:
        return None
    try:
        return int(str(valor))
    except (TypeError, ValueError):
        return None


def movilidad_efectiva_paciente(paciente: Paciente) -> Optional[int]:
    """
    Combina perfil clínico y evaluación inicial (o la más antigua si no hay inicial marcada).
    Usa el nivel más restrictivo (menor entero) entre perfil y métricas de evaluación.
    """
    perfil = paciente.perfil_clinico
    if not perfil:
        return None

    niveles: list[int] = []
    n = _nivel_a_int(perfil.nivel_movilidad)
    if n is not None:
        niveles.append(n)

    eval_qs = paciente.evaluaciones.all().order_by('-fecha_evaluacion')
    inicial = paciente.evaluaciones.filter(es_evaluacion_inicial=True).order_by('-fecha_evaluacion').first()
    evaluacion = inicial or eval_qs.order_by('fecha_evaluacion').first()

    if evaluacion and isinstance(evaluacion.metricas_objetivas, dict):
        raw = evaluacion.metricas_objetivas.get('nivel_movilidad')
        ne = _nivel_a_int(str(raw) if raw is not None else None)
        if ne is not None:
            niveles.append(ne)

    if not niveles:
        return None
    return min(niveles)


def ejercicio_compatible_territorio(
    territorios_ejercicio: Optional[list],
    territorio_paciente: Optional[str],
) -> bool:
    tlist = territorios_ejercicio or []
    if not tlist:
        return True
    if TerritorioACV.CUALQUIERA in tlist:
        return True
    if not territorio_paciente:
        return True
    return territorio_paciente in tlist


def ejercicio_compatible_movilidad(ejercicio: Ejercicio, nivel_paciente: int) -> bool:
    mn = _nivel_a_int(ejercicio.movilidad_paciente_min)
    mx = _nivel_a_int(ejercicio.movilidad_paciente_max)
    if mn is None or mx is None:
        return True
    if mn > mx:
        mn, mx = mx, mn
    return mn <= nivel_paciente <= mx


def filtrar_ejercicios_por_paciente(ejercicios: Iterable[Ejercicio], paciente: Paciente) -> list[Ejercicio]:
    nivel = movilidad_efectiva_paciente(paciente)
    territorio = None
    if paciente.perfil_clinico:
        territorio = paciente.perfil_clinico.territorio_acv

    if nivel is None:
        return []

    out: list[Ejercicio] = []
    for ej in ejercicios:
        if not ejercicio_compatible_movilidad(ej, nivel):
            continue
        if not ejercicio_compatible_territorio(ej.territorios_acv_compatibles, territorio):
            continue
        out.append(ej)
    return out
