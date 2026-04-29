import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Ejercicio, EjercicioFormData } from '../../models/ejercicio.model';
import { sinCaracteresBusquedaHtml, urlHttpOpcional } from '../../validators/ejercicio-form.validators';

@Component({
  selector: 'app-ejercicio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './ejercicio-form.component.html',
  styleUrl: './ejercicio-form.component.scss',
})
export class EjercicioFormComponent implements OnInit {
  @Input() initialData?: Ejercicio;
  @Input() isEdit = false;
  @Output() formSubmit = new EventEmitter<EjercicioFormData>();
  @Output() cancelClick = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  longitud(controlName: string): number {
    const v = this.form.get(controlName)?.value;
    return typeof v === 'string' ? v.length : 0;
  }

  bloquearPegado(event: ClipboardEvent): void {
    event.preventDefault();
    this.snack.open('Pegar no está permitido. Escribe el contenido manualmente.', 'Cerrar', { duration: 4200 });
  }

  bloquearCopia(event: ClipboardEvent): void {
    event.preventDefault();
    this.snack.open('Copiar y cortar no están permitidos en este campo.', 'Cerrar', { duration: 3200 });
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(140),
          sinCaracteresBusquedaHtml(true),
        ],
      ],
      descripcion: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(800),
          sinCaracteresBusquedaHtml(true),
        ],
      ],
      instrucciones: [
        '',
        [
          Validators.required,
          Validators.minLength(40),
          Validators.maxLength(4000),
          sinCaracteresBusquedaHtml(false),
        ],
      ],
      material_necesario: [
        '',
        [Validators.required, Validators.maxLength(200), sinCaracteresBusquedaHtml(true)],
      ],
      categoria: ['MOVILIDAD', [Validators.required]],
      dificultad: ['INTERMEDIO', [Validators.required]],
      video_url: ['', [Validators.maxLength(500), urlHttpOpcional()]],
      imagen_url: ['', [Validators.maxLength(500), urlHttpOpcional()]],
      evidencia_cientifica: ['', [Validators.maxLength(2000), sinCaracteresBusquedaHtml(false)]],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as EjercicioFormData);
      return;
    }
    this.form.markAllAsTouched();
    this.snack.open('Revisa los campos marcados en rojo.', 'Cerrar', { duration: 4000 });
  }
}
