import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Evita @ , ? < > y comas (p. ej. pegados de búsquedas o HTML).
 * `prohibirDosPuntos`: true en campos cortos (nombre, material); false en textos largos donde "1:" es útil.
 */
export function sinCaracteresBusquedaHtml(prohibirDosPuntos: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '');
    if (!v) {
      return null;
    }
    if (/[<>]/.test(v)) {
      return { etiquetasHtml: true };
    }
    if (/[@,?]/.test(v) || /,/.test(v)) {
      return { caracteresBusqueda: true };
    }
    if (prohibirDosPuntos && /:/.test(v)) {
      return { dosPuntosNoPermitido: true };
    }
    return null;
  };
}

export function urlHttpOpcional(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '').trim();
    if (!v) {
      return null;
    }
    if (!/^https:\/\/.+/i.test(v) && !/^http:\/\/.+/i.test(v)) {
      return { urlHttp: true };
    }
    try {
      const parsed = new URL(v);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { urlHttp: true };
      }
      return null;
    } catch {
      return { urlHttp: true };
    }
  };
}
