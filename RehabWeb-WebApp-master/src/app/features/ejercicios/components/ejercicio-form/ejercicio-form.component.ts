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
    MatSnackBarModule
  ],
  template: `
    <div class="form-wrapper py-4 animate-in">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="glass-form">
        <div class="form-header mb-5">
           <h2 class="form-title">{{ isEdit ? 'Actualizar Ejercicio' : 'Detalles del Nuevo Ejercicio' }}</h2>
           <p class="form-subtitle">Completa la ficha técnica para que los pacientes puedan seguir las instrucciones correctamente.</p>
        </div>

        <div class="form-section mb-5">
          <h3 class="section-title"><mat-icon>info</mat-icon> Información Básica</h3>
          <div class="row g-3">
            <div class="col-md-8">
              <mat-form-field appearance="outline" class="w-100 dark-field">
                <mat-label>Nombre del Ejercicio</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej: Elevación Lateral de Hombro">
                <mat-icon matPrefix color="primary">fitness_center</mat-icon>
                <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es requerido</mat-error>
              </mat-form-field>
            </div>
            <div class="col-md-4">
              <mat-form-field appearance="outline" class="w-100 dark-field">
                <mat-label>Dificultad</mat-label>
                <mat-select formControlName="dificultad">
                  <mat-option value="FACIL">Fácil</mat-option>
                  <mat-option value="INTERMEDIO">Intermedio</mat-option>
                  <mat-option value="DIFICIL">Difícil</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-100 mt-3 dark-field">
            <mat-label>Descripción Breve</mat-label>
            <textarea matInput formControlName="descripcion" rows="2" placeholder="Describe el objetivo principal del ejercicio..."></textarea>
          </mat-form-field>
        </div>

        <div class="form-section mb-5">
          <h3 class="section-title"><mat-icon>list_alt</mat-icon> Guía Terapéutica</h3>
          <mat-form-field appearance="outline" class="w-100 dark-field">
            <mat-label>Instrucciones Paso a Paso</mat-label>
            <textarea matInput formControlName="instrucciones" rows="6" placeholder="1. Posición inicial...\n2. Ejecución...\n3. Finalización..."></textarea>
          </mat-form-field>

          <div class="row g-3 mt-1">
            <div class="col-md-6">
              <mat-form-field appearance="outline" class="w-100 dark-field">
                <mat-label>Material Necesario</mat-label>
                <input matInput formControlName="material_necesario" placeholder="Ej: Mancuernas de 2kg, Silla...">
                <mat-icon matPrefix>handyman</mat-icon>
              </mat-form-field>
            </div>
            <div class="col-md-6">
              <mat-form-field appearance="outline" class="w-100 dark-field">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="categoria">
                  <mat-option value="FUERZA">Fuerza</mat-option>
                  <mat-option value="MOVILIDAD">Movilidad</mat-option>
                  <mat-option value="EQUILIBRIO">Equilibrio</mat-option>
                  <mat-option value="POSTURAL">Higiene Postural</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>

        <div class="form-section mb-5">
          <h3 class="section-title"><mat-icon>media_output</mat-icon> Multimedia & Ciencia</h3>
          <div class="row g-3">
            <div class="col-md-6">
              <mat-form-field appearance="outline" class="w-100 dark-field">
                <mat-label>URL Video Educativo</mat-label>
                <input matInput formControlName="video_url">
                <mat-icon matSuffix>play_circle</mat-icon>
              </mat-form-field>
            </div>
            <div class="col-md-6">
              <mat-form-field appearance="outline" class="w-100 dark-field">
                <mat-label>URL Imagen Descriptiva</mat-label>
                <input matInput formControlName="imagen_url">
                <mat-icon matSuffix>add_photo_alternate</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-100 mt-3 dark-field">
            <mat-label>Base Científica / Evidencia</mat-label>
            <textarea matInput formControlName="evidencia_cientifica" rows="2" placeholder="Cita de estudio o justificación médica..."></textarea>
            <mat-icon matSuffix>science</mat-icon>
          </mat-form-field>
        </div>

        <div class="actions-footer py-4 border-top d-flex justify-content-between align-items-center">
          <button mat-button color="warn" type="button" (click)="cancelClick.emit()" class="cancel-btn">
            <mat-icon>close</mat-icon> DESCARTAR
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" class="submit-btn px-5">
            {{ isEdit ? 'ACTUALIZAR EJERCICIO' : 'GUARDAR Y PUBLICAR' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .glass-form {
      max-width: 900px;
      margin: 0 auto;
      background: var(--color-bg-card);
      padding: var(--space-7);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
    }

    .form-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      letter-spacing: var(--tracking-normal);
      margin-bottom: var(--space-2);
    }

    .form-subtitle {
     color: var(--color-text-secondary);
     font-size: var(--text-m);
    }

    .section-title {
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      margin-bottom: var(--space-4);
      display: flex;
      align-items: center;
      mat-icon { margin-right: var(--space-2); font-size: 20px; width: 20px; height: 20px;}
    }

    .dark-field ::ng-deep .mat-mdc-form-field-flex {
      background-color: var(--color-bg-app) !important;
      border-radius: var(--radius-sm) !important;
      transition: all var(--duration-base) var(--easing-default);
    }

    .dark-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: var(--color-bg-card) !important;
    }

    .submit-btn {
      height: 56px;
      border-radius: var(--radius-xl) !important;
      font-weight: var(--font-bold);
      font-size: var(--text-m);
      background: var(--color-primary);
      transition: transform var(--duration-fast), filter var(--duration-base);
      &:hover { transform: translateY(-1px); filter: brightness(1.1); }
      &:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
    }

    .cancel-btn {
      height: 56px;
      border-radius: var(--radius-xl) !important;
      font-weight: var(--font-bold);
      transition: background var(--duration-base);
      &:hover { background: var(--color-danger-bg); }
      &:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
    }

    @media (max-width: 768px) {
      .glass-form { padding: var(--space-4); }
    }
  `]
})
export class EjercicioFormComponent implements OnInit {
  @Input() initialData?: Ejercicio;
  @Input() isEdit = false;
  @Output() formSubmit = new EventEmitter<EjercicioFormData>();
  @Output() cancelClick = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      instrucciones: ['', [Validators.required]],
      material_necesario: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      dificultad: ['INTERMEDIO', [Validators.required]],
      video_url: [''],
      imagen_url: [''],
      evidencia_cientifica: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }
}
