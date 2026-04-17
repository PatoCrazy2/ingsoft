import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioCardComponent } from '../../components/ejercicio-card/ejercicio-card.component';
import { Ejercicio } from '../../models/ejercicio.model';
import { AuthService } from '../../../../core/auth/auth.service';

type FalloCarga = 'none' | 'auth' | 'other';

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
export class BibliotecaEjerciciosPage implements OnInit {
  private readonly ejercicioService = inject(EjercicioService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  loading = this.ejercicioService.loading;

  searchQuery = '';
  /** Respuesta del API (solo publicados); la búsqueda filtra sobre esto, no sobre la señal global del servicio. */
  private readonly listaBiblioteca = signal<Ejercicio[]>([]);
  filteredEjercicios = signal<Ejercicio[]>([]);
  cargaFallida = signal<FalloCarga>('none');

  constructor() {
    this.auth.sesionLista$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargar());
  }

  ngOnInit(): void {
    void this.auth.asegurarTokenDemo().then(() => this.cargar());
  }

  private cargar(): void {
    void this.auth.asegurarTokenDemo().then(() => {
      this.ejercicioService.getEjercicios({ estado: 'PUBLICADO' }).subscribe({
        next: (data: Ejercicio[]) => {
          this.cargaFallida.set('none');
          this.listaBiblioteca.set(data);
          this.aplicarFiltroBusqueda();
        },
        error: (err: HttpErrorResponse) => {
          this.listaBiblioteca.set([]);
          this.filteredEjercicios.set([]);
          this.cargaFallida.set(err.status === 401 || err.status === 403 ? 'auth' : 'other');
        },
      });
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
