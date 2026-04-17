import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioPreviewComponent } from '../../components/ejercicio-preview/ejercicio-preview.component';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  standalone: true,
  imports: [CommonModule, EjercicioPreviewComponent],
  template: `
    <div class="container py-4">
      @if (ejercicio) {
        <app-ejercicio-preview [ejercicio]="ejercicio"></app-ejercicio-preview>
      }
    </div>
  `
})
export class EjercicioDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(EjercicioService);
  
  ejercicio?: Ejercicio;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getPreview(id).subscribe(data => this.ejercicio = data);
    }
  }
}
