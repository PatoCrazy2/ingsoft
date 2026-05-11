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
    <div class="form-wrapper animate-in">
      <nav class="form-nav mb-4">
        <button type="button" class="back-link" (click)="cancelClick.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver a la administración
        </button>
      </nav>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="glass-form">
        <div class="form-header">
           <h2 class="form-title">{{ isEdit ? 'Actualizar Ficha Médica' : 'Nueva Propuesta de Ejercicio' }}</h2>
           <p class="form-subtitle">Define los parámetros clínicos y multimedia del ejercicio para su posterior validación.</p>
        </div>

        <div class="form-grid">
          <!-- SECCIÓN 1 -->
          <div class="form-section">
            <div class="section-badge">1</div>
            <h3 class="section-title">Información Identificativa</h3>
            <p class="section-desc">Define cómo aparecerá el ejercicio en el catálogo.</p>
            
            <div class="field-group">
              <label class="field__label">Nombre del Ejercicio</label>
              <div class="input-with-icon">
                <svg class="input-with-icon__icon--left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v8H2z"></path><line x1="6" y1="12" x2="6" y2="12"></line></svg>
                <input type="text" formControlName="nombre" class="has-icon-left" placeholder="Ej: Flexión de cadera en supino">
              </div>
              <span class="field__error" *ngIf="form.get('nombre')?.invalid && form.get('nombre')?.touched">Este campo es obligatorio</span>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="field__label">Nivel de Dificultad</label>
                <select formControlName="dificultad" class="field__select">
                  <option value="FACIL">🟢 Fácil / Inicial</option>
                  <option value="INTERMEDIO">🟡 Intermedio / Progresivo</option>
                  <option value="DIFICIL">🔴 Difícil / Avanzado</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="field__label">Área Terapéutica</label>
                <select formControlName="categoria" class="field__select">
                  <option value="FUERZA">💪 Fuerza Muscular</option>
                  <option value="MOVILIDAD">🤸 Movilidad / Flexibilidad</option>
                  <option value="EQUILIBRIO">⚖️ Equilibrio / Coordinación</option>
                  <option value="POSTURAL">🧘 Higiene Postural</option>
                </select>
              </div>
            </div>

            <div class="mt-3">
              <label class="field__label">Objetivo Clínico (Resumen)</label>
              <textarea formControlName="descripcion" class="field__textarea" rows="2" placeholder="Describe brevemente qué se busca lograr..."></textarea>
            </div>
          </div>

          <!-- SECCIÓN 2 -->
          <div class="form-section">
            <div class="section-badge">2</div>
            <h3 class="section-title">Protocolo de Ejecución</h3>
            <p class="section-desc">Instrucciones detalladas para el terapeuta y el paciente.</p>

            <div class="mb-3">
              <label class="field__label">Guía Paso a Paso</label>
              <textarea formControlName="instrucciones" class="field__textarea" rows="5" placeholder="1. Posición inicial...\n2. Movimiento...\n3. Puntos de control..."></textarea>
            </div>

            <div>
              <label class="field__label">Equipamiento Necesario</label>
              <div class="input-with-icon">
                <svg class="input-with-icon__icon--left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                <input type="text" formControlName="material_necesario" class="has-icon-left" placeholder="Ej: Banda elástica, pelota suiza, silla estable...">
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3 -->
          <div class="form-section full-width">
            <div class="section-badge">3</div>
            <h3 class="section-title">Multimedia y Evidencia Científica</h3>
            <p class="section-desc">Soportes visuales y base médica del ejercicio.</p>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="field__label">Enlace al Video (YouTube/Vimeo)</label>
                <div class="input-with-icon">
                  <input type="text" formControlName="video_url" class="has-icon-right" placeholder="https://youtube.com/...">
                  <svg class="input-with-icon__icon--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                </div>
              </div>
              <div class="col-md-6">
                <label class="field__label">Imagen de Portada (URL)</label>
                <div class="input-with-icon">
                  <input type="text" formControlName="imagen_url" class="has-icon-right" placeholder="https://cloudinary.com/...">
                  <svg class="input-with-icon__icon--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <label class="field__label">Base Científica / Justificación</label>
              <div class="input-with-icon">
                <textarea formControlName="evidencia_cientifica" class="field__textarea has-icon-right" rows="2" placeholder="Cita de estudio o razonamiento clínico para el validador..."></textarea>
                <svg class="input-with-icon__icon--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 4c0 2.72-2.6 5.3-5.91 5.91a22 22 0 0 1-3.95 2.1l-3-3z"></path><line x1="8" y1="8" x2="12" y2="12"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions mt-5">
          <button type="button" class="btn-ghost" (click)="cancelClick.emit()">
            DESCARTAR CAMBIOS
          </button>
          <button type="submit" [disabled]="form.invalid" class="btn-primary">
            {{ isEdit ? 'ACTUALIZAR FICHA' : 'PUBLICAR EJERCICIO' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-wrapper {
      max-width: 1000px;
      margin: 0 auto;
      padding: var(--space-4);
    }

    .form-nav {
      display: flex;
      align-items: center;
    }

    .back-link {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-secondary);
      font-weight: var(--font-medium);
      font-size: var(--text-s);
      cursor: pointer;
      transition: color var(--duration-base);
      padding: var(--space-2) 0;

      &:hover { color: var(--color-primary); }
    }

    .glass-form {
      background: var(--color-bg-card);
      padding: var(--space-6) var(--space-7);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border);
    }

    .form-header {
      margin-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-4);
    }

    .form-title {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-1);
    }

    .form-subtitle {
      color: var(--color-text-secondary);
      font-size: var(--text-s);
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
    }

    .form-section {
      position: relative;
      padding-top: var(--space-4);
      
      &.full-width {
        grid-column: 1 / -1;
        background: var(--color-bg-app);
        margin: 0 calc(var(--space-7) * -1);
        padding: var(--space-5) var(--space-7);
      }
    }

    .section-badge {
      position: absolute;
      left: -48px;
      top: 20px;
      width: 28px;
      height: 28px;
      background: var(--color-primary-low);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: var(--font-bold);
      font-size: var(--text-xs);
    }

    .section-title {
      font-size: var(--text-m);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-1);
    }

    .section-desc {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
    }

    .field-group { margin-bottom: var(--space-4); }

    .field__label {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
    }

    .field__error {
      display: block;
      color: var(--color-danger);
      font-size: var(--text-xs);
      margin-top: var(--space-1);
    }

    $control-height: 44px;

    input[type="text"],
    .field__select,
    .field__textarea {
      display: block;
      width: 100%;
      height: $control-height;
      padding: 0 var(--space-3);
      font-family: var(--font-family);
      font-size: var(--text-s);
      color: var(--color-text-primary);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      outline: none;
      transition: all var(--duration-base) var(--easing-default);

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px var(--color-primary-low);
      }
    }

    .field__textarea {
      height: auto;
      padding: var(--space-2) var(--space-3);
      resize: vertical;
    }

    .field__select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23707E8C' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right var(--space-3) center;
      background-size: 14px;
      cursor: pointer;
    }

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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
    }

    .btn-primary {
      background: var(--color-primary);
      color: #fff;
      font-size: var(--text-s);
      font-weight: var(--font-bold);
      padding: 0 var(--space-6);
      height: 48px;
      border-radius: var(--radius-pill);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 167, 129, 0.2);
      transition: all var(--duration-base) var(--easing-default);

      &:hover  { filter: brightness(1.08); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 167, 129, 0.3); }
      &:active { transform: translateY(0); }
      &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    }

    .btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
      font-size: var(--text-s);
      font-weight: var(--font-bold);
      padding: 0 var(--space-5);
      height: 48px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: all var(--duration-base);

      &:hover { background: var(--color-bg-app); color: var(--color-danger); border-color: var(--color-danger); }
    }

    @media (max-width: 850px) {
      .form-grid { grid-template-columns: 1fr; }
      .section-badge { display: none; }
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
