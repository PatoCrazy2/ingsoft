import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioCardComponent } from '../../components/ejercicio-card/ejercicio-card.component';
import { Ejercicio } from '../../models/ejercicio.model';
import { AuthService } from '../../../../core/auth/auth.service';

type FalloCarga = 'none' | 'other';

@Component({
  selector: 'app-biblioteca-ejercicios',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EjercicioCardComponent,
    FormsModule,
  ],
  templateUrl: './biblioteca-ejercicios.component.html',
  styleUrl: './biblioteca-ejercicios.component.scss',
})
export class BibliotecaEjerciciosPage {
  private readonly auth = inject(AuthService);
  private readonly ejercicioService = inject(EjercicioService);
  private readonly destroyRef = inject(DestroyRef);

  loading = this.ejercicioService.loading;
  cargaFallida = signal<FalloCarga>('none');

  // Data State
  private readonly listaBase = signal<Ejercicio[]>([]);
  categorias = signal<{ codigo: string, nombre: string }[]>([]);

  // Filters State
  searchQuery = signal('');
  selectedCategoria = signal('');
  selectedDificultad = signal('');

  // Result logic
  filteredEjercicios = computed(() => {
    let list = this.listaBase();
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategoria();
    const diff = this.selectedDificultad();

    if (query) {
      list = list.filter(e =>
        e.nombre.toLowerCase().includes(query) ||
        e.descripcion.toLowerCase().includes(query)
      );
    }

    if (cat) {
      list = list.filter(e => e.categoria === cat);
    }

    if (diff) {
      list = list.filter(e => e.dificultad === diff);
    }

    return list;
  });

  constructor() {
    afterNextRender(() => this.cargar());
  }

  cargar(): void {
    void this.auth.asegurarTokenDemo().then(() => {
      this.cargarCategorias();
      this.ejercicioService
        .getEjercicios({ estado: 'PUBLICADO' })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.cargaFallida.set('none');
            this.listaBase.set(data);
          },
          error: () => {
            this.listaBase.set([]);
            this.cargaFallida.set('other');
          },
        });
    });
  }

  private cargarCategorias(): void {
    this.ejercicioService.getCategoriasEjercicio()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cats => this.categorias.set(cats));
  }

  limpiarFiltros(): void {
    this.searchQuery.set('');
    this.selectedCategoria.set('');
    this.selectedDificultad.set('');
  }
}
