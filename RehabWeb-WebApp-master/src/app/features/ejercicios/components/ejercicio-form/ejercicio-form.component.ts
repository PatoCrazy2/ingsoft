import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Ejercicio, EjercicioFormData } from '../../models/ejercicio.model';

@Component({
  selector: 'app-ejercicio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="form-wrapper py-4 animate-in">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="glass-form">
        <div class="form-header mb-5">
           <h2 class="form-title">{{ isEdit ? 'Actualizar Ejercicio' : 'Proponer Nuevo Ejercicio' }}</h2>
           <p class="form-subtitle">Completa la ficha técnica para que los pacientes puedan seguir las instrucciones correctamente.</p>
        </div>

        <div class="form-section mb-5">
          <h3 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Información Básica
          </h3>
          <div class="row g-3">
            <div class="col-md-8">
              <label class="field__label">Nombre del Ejercicio</label>
              <div class="input-with-icon">
                <svg class="input-with-icon__icon--left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v8H2z"></path><line x1="6" y1="12" x2="6" y2="12"></line></svg>
                <input type="text" formControlName="nombre" class="has-icon-left" placeholder="Ej: Elevación Lateral de Hombro">
              </div>
              <span class="field__error" *ngIf="form.get('nombre')?.invalid && form.get('nombre')?.touched">El nombre es requerido</span>
            </div>
            <div class="col-md-4">
              <label class="field__label">Dificultad</label>
              <select formControlName="dificultad" class="field__select">
                <option value="FACIL">Fácil</option>
                <option value="INTERMEDIO">Intermedio</option>
                <option value="DIFICIL">Difícil</option>
              </select>
            </div>
          </div>

          <div class="mt-3">
            <label class="field__label">Descripción Breve</label>
            <textarea formControlName="descripcion" class="field__textarea" rows="2" placeholder="Describe el objetivo principal del ejercicio..."></textarea>
          </div>
        </div>

        <div class="form-section mb-5">
          <h3 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Guía Terapéutica
          </h3>
          <div class="mb-3">
            <label class="field__label">Instrucciones Paso a Paso</label>
            <textarea formControlName="instrucciones" class="field__textarea" rows="6" placeholder="1. Posición inicial...\n2. Ejecución...\n3. Finalización..."></textarea>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="field__label">Material Necesario</label>
              <div class="input-with-icon">
                <svg class="input-with-icon__icon--left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                <input type="text" formControlName="material_necesario" class="has-icon-left" placeholder="Ej: Mancuernas de 2kg, Silla...">
              </div>
            </div>
            <div class="col-md-6">
              <label class="field__label">Categoría</label>
              <select formControlName="categoria" class="field__select">
                <option value="FUERZA">Fuerza</option>
                <option value="MOVILIDAD">Movilidad</option>
                <option value="EQUILIBRIO">Equilibrio</option>
                <option value="POSTURAL">Higiene Postural</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section mb-5">
          <h3 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Multimedia & Ciencia
          </h3>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="field__label">URL Video Educativo</label>
              <div class="input-with-icon">
                <input type="text" formControlName="video_url" class="has-icon-right" placeholder="https://...">
                <svg class="input-with-icon__icon--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              </div>
            </div>
            <div class="col-md-6">
              <label class="field__label">URL Imagen Descriptiva</label>
              <div class="input-with-icon">
                <input type="text" formControlName="imagen_url" class="has-icon-right" placeholder="https://...">
                <svg class="input-with-icon__icon--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </div>
          </div>

          <div class="mt-3">
            <label class="field__label">Base Científica / Evidencia</label>
            <div class="input-with-icon">
              <textarea formControlName="evidencia_cientifica" class="field__textarea has-icon-right" rows="2" placeholder="Cita de estudio o justificación médica..."></textarea>
              <svg class="input-with-icon__icon--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 4c0 2.72-2.6 5.3-5.91 5.91a22 22 0 0 1-3.95 2.1l-3-3z"></path><line x1="8" y1="8" x2="12" y2="12"/></svg>
            </div>
          </div>
        </div>

        <div class="actions-footer py-4 border-top d-flex justify-content-between align-items-center">
          <button type="button" (click)="cancelClick.emit()" class="cancel-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            DESCARTAR
          </button>
          <button type="submit" [disabled]="form.invalid" class="submit-btn px-5">
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
    }

    .field__label {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
    }

    .field__error {
      display: block;
      color: var(--color-danger);
      font-size: var(--text-xs);
      margin-top: var(--space-1);
    }

    /* ── ALTURA BASE UNIFORME ── */
    $control-height: 40px;

    /* ── INPUT ESTÁNDAR ── */
    input[type="text"],
    input[type="url"],
    .field__input {
      display: block;
      width: 100%;
      height: $control-height;
      padding: 0 var(--space-3);
      font-family: var(--font-family);
      font-size: var(--text-s);
      color: var(--color-text-primary);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      outline: none;
      transition: all var(--duration-base) var(--easing-default);

      &::placeholder { color: var(--color-text-muted); }
      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(0, 167, 129, 0.15);
      }
    }

    /* ── TEXTAREA ── */
    .field__textarea {
      display: block;
      width: 100%;
      min-height: 80px;
      padding: var(--space-2) var(--space-3);
      font-family: var(--font-family);
      font-size: var(--text-s);
      color: var(--color-text-primary);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      outline: none;
      resize: vertical;
      transition: all var(--duration-base) var(--easing-default);

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(0, 167, 129, 0.15);
      }
    }

    /* ── SELECT ── */
    .field__select {
      display: block;
      width: 100%;
      height: $control-height;
      padding: 0 var(--space-6) 0 var(--space-3);
      font-family: var(--font-family);
      font-size: var(--text-s);
      color: var(--color-text-primary);
      background-color: var(--color-bg-card);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23707E8C' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right var(--space-3) center;
      background-size: 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      appearance: none;
      outline: none;
      cursor: pointer;
      transition: all var(--duration-base) var(--easing-default);

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(0, 167, 129, 0.15);
      }
    }

    /* ── INPUT CON ICONO ── */
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;

      &__icon--left,
      &__icon--right {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: var(--color-text-muted);
        pointer-events: none;
        z-index: 1;
      }
      &__icon--left { left: var(--space-3); }
      &__icon--right { right: var(--space-3); }

      input, textarea {
        &.has-icon-left { padding-left: calc(var(--space-3) + 18px + var(--space-2)); }
        &.has-icon-right { padding-right: calc(var(--space-3) + 18px + var(--space-2)); }
      }
    }

    .submit-btn {
      height: 48px;
      border-radius: var(--radius-pill) !important;
      font-weight: var(--font-bold);
      font-size: var(--text-s);
      background: var(--color-primary);
      color: #fff;
      border: none;
      cursor: pointer;
      transition: transform var(--duration-fast), filter var(--duration-base);
      &:hover { transform: translateY(-1px); filter: brightness(1.1); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .cancel-btn {
      height: 48px;
      border-radius: var(--radius-pill) !important;
      font-weight: var(--font-bold);
      font-size: var(--text-s);
      background: var(--color-bg-app);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      padding: 0 var(--space-4);
      transition: all var(--duration-base);
      &:hover { background: var(--color-danger-bg); color: var(--color-danger); border-color: var(--color-danger); }
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
