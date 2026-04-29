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
    <div class="container-fluid py-5 animate-in">
      <div class="row">
        <div class="col-lg-8">
          <div class="mb-4">
             <h1 class="page-title">Revisión de Ejercicio</h1>
             <p class="page-subtitle">Revisa el contenido antes de aprobar su publicación.</p>
          </div>
          @if (ejercicio) {
            <app-ejercicio-preview [ejercicio]="ejercicio"></app-ejercicio-preview>
          }
        </div>
        <div class="col-lg-4">
          <div class="sticky-top" style="top: var(--space-4);">
            <app-validacion-panel 
              (validated)="onValidate($event)">
            </app-validacion-panel>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }
    .page-subtitle {
      font-size: var(--text-m);
      color: var(--color-text-secondary);
    }
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
          this.snack.open('Validación completada', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/ejercicios/admin']);
        },
        error: () => this.snack.open('Error al validar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
