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
    <div class="validation-panel p-4 bg-light rounded-4 border">
      <h3 class="fw-bold mb-4 d-flex align-items-center">
        <mat-icon class="me-2 text-warning">rate_review</mat-icon> Panel de Validación
      </h3>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label class="form-label d-block fw-bold mb-2">¿Es este ejercicio apto para publicación?</label>
          <mat-radio-group formControlName="es_valido" class="d-flex gap-4">
            <mat-radio-button [value]="true" color="primary">SÍ, ES VÁLIDO</mat-radio-button>
            <mat-radio-button [value]="false" color="warn">NO, REQUIERE CAMBIOS</mat-radio-button>
          </mat-radio-group>
        </div>

        <mat-form-field appearance="outline" class="w-100 mb-3">
          <mat-label>Comentarios de revisión</mat-label>
          <textarea matInput formControlName="comentario" rows="4" 
            placeholder="Explica los motivos de tu decisión o sugiere mejoras..."></textarea>
          <mat-hint>Estos comentarios serán visibles para el autor si se rechaza.</mat-hint>
        </mat-form-field>

        <div class="d-flex justify-content-end mt-4">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            FINALIZAR REVISIÓN
          </button>
        </div>
      </form>

      <div *ngIf="historial.length > 0" class="mt-5">
        <h5 class="fw-bold text-secondary mb-3">Historial de Validaciones</h5>
        <div class="list-group list-group-flush">
          <div *ngFor="let v of historial" class="list-group-item bg-transparent px-0 py-3">
            <div class="d-flex justify-content-between">
               <span [class]="v.es_valido ? 'text-success fw-bold' : 'text-danger fw-bold'">
                 {{ v.es_valido ? 'APROBADO' : 'RECHAZADO' }}
               </span>
               <span class="small text-secondary">{{ v.fecha_validacion | date:'short' }}</span>
            </div>
            <p class="mb-0 mt-1 fst-italic">"{{ v.comentario }}"</p>
            <p class="small text-secondary mb-0">Por: {{ v.revisor_nombre }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .validation-panel {
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
