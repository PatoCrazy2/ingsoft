import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioFormComponent } from '../../components/ejercicio-form/ejercicio-form.component';
import { Ejercicio } from '../../models/ejercicio.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  imports: [CommonModule, EjercicioFormComponent],
  template: `
    <div class="container py-5">
      <h1 class="mb-4">{{ isEdit ? 'Editar Ejercicio' : 'Nuevo Ejercicio' }}</h1>
      <app-ejercicio-form 
        [initialData]="ejercicio" 
        [isEdit]="isEdit"
        (formSubmit)="onSave($event)"
        (cancelClick)="onCancel()">
      </app-ejercicio-form>
    </div>
  `
})
export class EjercicioEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(EjercicioService);
  private snack = inject(MatSnackBar);

  ejercicio?: Ejercicio;
  isEdit = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.service.getEjercicio(id).subscribe(data => this.ejercicio = data);
    }
  }

  onSave(data: any): void {
    const obs = this.isEdit && this.ejercicio 
      ? this.service.updateEjercicio(this.ejercicio.id, data)
      : this.service.createEjercicio(data);

    obs.subscribe({
      next: () => {
        this.snack.open('Ejercicio guardado con éxito', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/ejercicios/admin']);
      },
      error: () => this.snack.open('Error al guardar', 'Cerrar', { duration: 3000 })
    });
  }

  onCancel(): void {
    this.router.navigate(['/ejercicios/admin']);
  }
}
