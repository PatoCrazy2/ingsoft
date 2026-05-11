import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatRadioModule
  ],
  template: `
    <div class="validation-panel glass-panel">
      <div class="panel-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="panel-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <h3 class="panel-title">Panel de Validación</h3>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="val-form">
        <div class="form-section">
          <label class="form-label">¿Es apto para publicación?</label>
          <div class="radio-group">
            <label class="radio-item" [class.active]="form.get('es_valido')?.value === true">
              <input type="radio" [value]="true" formControlName="es_valido">
              <span class="radio-label success">Aprobar</span>
            </label>
            <label class="radio-item" [class.active]="form.get('es_valido')?.value === false">
              <input type="radio" [value]="false" formControlName="es_valido">
              <span class="radio-label danger">Rechazar</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label" for="comentario">Comentarios de revisión</label>
          <textarea id="comentario" formControlName="comentario" rows="4" 
                    class="elegant-textarea"
                    placeholder="Escribe aquí tus observaciones técnicas..."></textarea>
          <p class="form-hint">Visible para el autor si se rechaza.</p>
        </div>

        <button type="submit" [disabled]="form.invalid" class="btn-submit-premium">
          Finalizar Revisión
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      </form>

      @if (historial.length > 0) {
        <div class="history-section">
          <h4 class="history-title">Historial de Revisiones</h4>
          <div class="history-list">
            <div *ngFor="let v of historial" class="history-item">
              <div class="item-head">
                 <span class="status-badge" [class.success]="v.es_valido" [class.danger]="!v.es_valido">
                   {{ v.es_valido ? 'Aprobado' : 'Rechazado' }}
                 </span>
                 <span class="item-date">{{ v.fecha_validacion | date:'dd MMM, yyyy' }}</span>
              </div>
              <p class="item-comment">"{{ v.comentario }}"</p>
              <p class="item-author">Por: {{ v.revisor_nombre }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .glass-panel {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      box-shadow: var(--shadow-lg);
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
      color: var(--color-primary);
    }

    .panel-icon { width: 24px; height: 24px; }
    .panel-title { font-size: var(--text-l); font-weight: var(--font-bold); color: var(--color-text-primary); margin: 0; }

    .form-section { margin-bottom: var(--space-4); }

    .form-label {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      margin-bottom: var(--space-2);
    }

    .radio-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
    }

    .radio-item {
      position: relative;
      cursor: pointer;
      input { position: absolute; opacity: 0; }
      .radio-label {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: var(--text-s);
        font-weight: var(--font-bold);
        color: var(--color-text-secondary);
        transition: all var(--duration-base);
      }
      &.active {
        .radio-label.success { background: var(--color-primary-low); border-color: var(--color-primary); color: var(--color-primary); }
        .radio-label.danger { background: var(--color-danger-bg); border-color: var(--color-danger); color: var(--color-danger); }
      }
    }

    .elegant-textarea {
      width: 100%;
      background: var(--color-bg-app);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      font-family: inherit;
      font-size: var(--text-s);
      color: var(--color-text-primary);
      outline: none;
      transition: all var(--duration-base);
      resize: none;
      &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(0, 167, 129, 0.1); }
    }

    .form-hint { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 4px; }

    .btn-submit-premium {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      background: var(--color-primary);
      color: white;
      border: none;
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      font-weight: var(--font-bold);
      cursor: pointer;
      transition: all var(--duration-base);
      &:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: var(--shadow-md); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-icon { width: 18px; height: 18px; }

    .history-section { margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border); }
    .history-title { font-size: var(--text-s); font-weight: var(--font-bold); color: var(--color-text-secondary); margin-bottom: var(--space-3); }
    
    .history-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .history-item {
      padding: var(--space-3);
      background: var(--color-bg-app);
      border-radius: var(--radius-md);
    }
    .item-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
    .status-badge {
      font-size: 10px;
      font-weight: var(--font-bold);
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      &.success { background: var(--color-primary-low); color: var(--color-primary); }
      &.danger { background: var(--color-danger-bg); color: var(--color-danger); }
    }
    .item-date { font-size: var(--text-xs); color: var(--color-text-muted); }
    .item-comment { font-size: var(--text-s); color: var(--color-text-primary); font-style: italic; margin: 0 0 4px; }
    .item-author { font-size: var(--text-xs); color: var(--color-text-muted); margin: 0; }
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
