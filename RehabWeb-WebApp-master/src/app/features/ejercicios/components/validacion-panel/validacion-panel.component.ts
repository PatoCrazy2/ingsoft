import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ValidacionEjercicio, ValidacionFormData } from '../../models/validacion.model';

@Component({
  selector: 'app-validacion-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
  ],
  template: `
    <div class="validation-panel">
      <h3 class="panel-title">
        <mat-icon class="me-2 text-warning">rate_review</mat-icon> Panel de Validación
      </h3>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label class="form-label">¿Es este ejercicio apto para publicación?</label>
          <mat-radio-group formControlName="es_valido" class="d-flex gap-4">
            <mat-radio-button [value]="true" color="primary">SÍ, ES VÁLIDO</mat-radio-button>
            <mat-radio-button [value]="false" color="warn">NO, REQUIERE CAMBIOS</mat-radio-button>
          </mat-radio-group>
        </div>

        <mat-form-field appearance="outline" class="w-100 mb-3 dark-field">
          <mat-label>Comentarios de revisión</mat-label>
          <textarea matInput formControlName="comentario" rows="4" 
            placeholder="Explica los motivos de tu decisión o sugiere mejoras..."></textarea>
          <mat-hint>Estos comentarios serán visibles para el autor si se rechaza.</mat-hint>
        </mat-form-field>

        <div class="d-flex justify-content-end mt-4">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" class="submit-btn">
            FINALIZAR REVISIÓN
          </button>
        </div>
      </form>

      <div *ngIf="historial.length > 0" class="mt-5">
        <h5 class="history-title">Historial de Validaciones</h5>
        <div class="history-list">
          <div *ngFor="let v of historial" class="history-item">
            <div class="d-flex justify-content-between">
               <span class="badge" 
                     [class.badge--published]="v.es_valido"
                     [class.badge--danger]="!v.es_valido">
                 {{ v.es_valido ? 'APROBADO' : 'RECHAZADO' }}
               </span>
               <span class="small text-secondary">{{ v.fecha_validacion | date:'short' }}</span>
            </div>
            <p class="mb-0 mt-2 fst-italic">"{{ v.comentario }}"</p>
            <p class="small text-secondary mb-0">Por: {{ v.revisor_nombre }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .validation-panel {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .panel-title {
      font-size: var(--text-l);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-4);
      display: flex;
      align-items: center;
    }
    
    .form-label {
      display: block;
      font-size: var(--text-s);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .dark-field ::ng-deep .mat-mdc-form-field-flex {
      background-color: var(--color-bg-app) !important;
      border-radius: var(--radius-sm) !important;
    }

    .submit-btn {
      border-radius: var(--radius-xl) !important;
      font-weight: var(--font-bold);
      background: var(--color-primary);
    }

    .history-title {
      font-size: var(--text-m);
      font-weight: var(--font-bold);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-3);
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .history-item {
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg-app);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-pill);
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      text-transform: uppercase;

      &--published { background: var(--color-primary-low); color: var(--color-primary); }
      &--danger { background: var(--color-danger-bg); color: var(--color-danger); }
    }
  `]
})
export class ValidacionPanelComponent {
  @Input() historial: ValidacionEjercicio[] = [];
  @Output() validated = new EventEmitter<ValidacionFormData>();

  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    es_valido: [null, [Validators.required]],
    comentario: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.validated.emit(this.form.value);
    }
  }
}
