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
    <div class="container-fluid py-5">
      <div class="row">
        <div class="col-lg-8">
          <div class="mb-4">
             <h4 class="fw-bold">Revision de Ejercicio</h4>
             <p class="text-secondary">Revisa el contenido antes de aprobar su publicación.</p>
          </div>
          @if (ejercicio) {
            <app-ejercicio-preview [ejercicio]="ejercicio"></app-ejercicio-preview>
          }
        </div>
        <div class="col-lg-4">
          <div class="sticky-top" style="top: 20px;">
            <app-validacion-panel 
              (validated)="onValidate($event)">
            </app-validacion-panel>
          </div>
        </div>
      </div>
    </div>
  `
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
