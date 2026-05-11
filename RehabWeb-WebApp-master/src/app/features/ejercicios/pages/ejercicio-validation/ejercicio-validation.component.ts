import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioPreviewComponent } from '../../components/ejercicio-preview/ejercicio-preview.component';
import { ValidacionPanelComponent } from '../../components/validacion-panel/validacion-panel.component';
import { Ejercicio } from '../../models/ejercicio.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  imports: [CommonModule, EjercicioPreviewComponent, ValidacionPanelComponent],
  template: `
    <div class="validation-page animate-in">
      <header class="val-header">
        <div class="container-fluid">
          <div class="row align-items-end">
            <div class="col-lg-8">
               <span class="val-kicker">Revisión por Pares</span>
               <h1 class="val-title">Validación Clínica</h1>
               <p class="val-subtitle">Asegura la calidad del contenido terapéutico antes de su publicación general.</p>
            </div>
          </div>
        </div>
      </header>

      <div class="container-fluid py-4">
        <div class="row g-4">
          <div class="col-lg-8">
            @if (ejercicio) {
              <app-ejercicio-preview [ejercicio]="ejercicio"></app-ejercicio-preview>
            } @else {
              <div class="skeleton-preview"></div>
            }
          </div>
          <div class="col-lg-4">
            <div class="sticky-top" style="top: var(--space-4);">
              <app-validacion-panel 
                [historial]="ejercicio?.historial_validaciones || []"
                (validated)="onValidate($event)">
              </app-validacion-panel>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .validation-page { min-height: 100vh; background: var(--color-bg-app); }
    
    .val-header {
      padding: var(--space-6) 0 var(--space-4);
      background: var(--color-bg-card);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
    }

    .val-kicker {
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 4px;
    }

    .val-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .val-subtitle {
      font-size: var(--text-m);
      color: var(--color-text-secondary);
      margin: 4px 0 0;
    }

    .skeleton-preview {
      height: 600px;
      background: var(--color-bg-card);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      animation: pulse 2s infinite;
    }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `]
})
export class EjercicioValidationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(EjercicioService);
  private snack = inject(MatSnackBar);
  
  ejercicio?: Ejercicio;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getEjercicio(id).subscribe(data => this.ejercicio = data);
    }
  }

  onValidate(data: any): void {
    if (this.ejercicio) {
      this.service.validarEjercicio(this.ejercicio.id, data).subscribe({
        next: () => {
          this.snack.open('Revisión registrada con éxito', 'OK', { duration: 3000 });
          this.router.navigate(['/ejercicios/admin']);
        },
        error: () => this.snack.open('Error al procesar la validación', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
