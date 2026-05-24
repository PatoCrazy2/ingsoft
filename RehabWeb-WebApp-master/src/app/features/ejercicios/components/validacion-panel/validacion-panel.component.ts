import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidacionEjercicio, ValidacionFormData } from '../../models/validacion.model';

@Component({
  selector: 'app-validacion-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './validacion-panel.component.html',
  styleUrl: './validacion-panel.component.scss',
})
export class ValidacionPanelComponent implements OnInit {
  @Input() historial: ValidacionEjercicio[] = [];
  @Input() enviando = false;
  @Output() validated = new EventEmitter<ValidacionFormData>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    es_valido: [null as boolean | null, Validators.required],
    comentario: [''],
  });

  ngOnInit(): void {
    this.form.get('es_valido')?.valueChanges.subscribe((val) => {
      const comentario = this.form.get('comentario');
      if (val === false) {
        comentario?.setValidators([Validators.required, Validators.minLength(8)]);
      } else {
        comentario?.clearValidators();
      }
      comentario?.updateValueAndValidity({ emitEvent: false });
    });
  }

  seleccionarDecision(esValido: boolean): void {
    this.form.patchValue({ es_valido: esValido });
  }

  get decision(): boolean | null {
    return this.form.get('es_valido')?.value ?? null;
  }

  get comentarioRequerido(): boolean {
    return this.decision === false;
  }

  onSubmit(): void {
    if (this.form.valid && !this.enviando) {
      const raw = this.form.value;
      this.validated.emit({
        es_valido: raw.es_valido,
        comentario: raw.comentario?.trim() || undefined,
      });
    }
  }
}
