import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioCardComponent } from '../../components/ejercicio-card/ejercicio-card.component';
import { Ejercicio } from '../../models/ejercicio.model';

type FalloCarga = 'none' | 'other';

@Component({
  selector: 'app-biblioteca-ejercicios',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EjercicioCardComponent,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatButtonModule,
  ],
  templateUrl: './biblioteca-ejercicios.component.html',
  styleUrl: './biblioteca-ejercicios.component.scss',
})
export class BibliotecaEjerciciosPage {
  private readonly ejercicioService = inject(EjercicioService);
  private readonly destroyRef = inject(DestroyRef);

  loading = this.ejercicioService.loading;

  searchQuery = '';
  private readonly listaBiblioteca = signal<Ejercicio[]>([]);
  filteredEjercicios = signal<Ejercicio[]>([]);
  cargaFallida = signal<FalloCarga>('none');

  constructor() {
    afterNextRender(() => this.cargar());
  }

  private cargar(): void {
    this.ejercicioService
      .getEjercicios({ estado: 'PUBLICADO' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Ejercicio[]) => {
          this.cargaFallida.set('none');
          this.listaBiblioteca.set(data);
          this.aplicarFiltroBusqueda();
        },
        error: (_err: HttpErrorResponse) => {
          this.listaBiblioteca.set([]);
          this.filteredEjercicios.set([]);
          this.cargaFallida.set('other');
        },
      });
  }

  onSearch(): void {
    this.aplicarFiltroBusqueda();
  }

  private aplicarFiltroBusqueda(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const base = this.listaBiblioteca();
    if (!query) {
      this.filteredEjercicios.set(base);
      return;
    }
    this.filteredEjercicios.set(
      base.filter(
        (e) =>
          e.nombre.toLowerCase().includes(query) ||
          (e.categoria ?? '').toLowerCase().includes(query) ||
          e.descripcion.toLowerCase().includes(query),
      ),
    );
  }

  limpiarBusqueda(): void {
    this.searchQuery = '';
    this.aplicarFiltroBusqueda();
  }
}
