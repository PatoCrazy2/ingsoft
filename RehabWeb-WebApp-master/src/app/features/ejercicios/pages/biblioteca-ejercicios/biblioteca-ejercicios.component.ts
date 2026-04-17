import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioCardComponent } from '../../components/ejercicio-card/ejercicio-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-biblioteca-ejercicios',
  standalone: true,
  imports: [
    CommonModule,
    EjercicioCardComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  template: `
    <div class="biblioteca-container">
      <header class="biblioteca-header">
        <div class="header-content">
          <h1 class="mat-display-1 fw-bold">Biblioteca de Ejercicios</h1>
          <p class="mat-body-large text-secondary">
            Explora recursos terapéuticos validados y gestiona tus rutinas.
          </p>

          <div class="search-container mt-4">
            <mat-form-field appearance="outline" class="w-100 search-field">
              <mat-label>Buscar ejercicios o categorías</mat-label>
              <input matInput [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Ej: Rodilla, Fuerza...">
              <mat-icon matSuffix color="primary">search</mat-icon>
            </mat-form-field>
          </div>
        </div>
      </header>

      <main class="biblioteca-main">
        @if (loading()) {
          <div class="loading-state">
            <mat-spinner diameter="60"></mat-spinner>
            <p>Cargando biblioteca...</p>
          </div>
        } @else {
          <div class="ejercicios-grid">
            @for (e of filteredEjercicios(); track e.id) {
              <app-ejercicio-card [ejercicio]="e" class="grid-item"></app-ejercicio-card>
            } @empty {
              <div class="empty-state">
                <mat-icon>inventory_2</mat-icon>
                <p>No se encontraron resultados para tu búsqueda.</p>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .biblioteca-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      min-height: 100vh;
    }

    .biblioteca-header {
      margin-bottom: 3rem;
      text-align: center;
    }
      
    .header-content {
      max-width: 700px;
      margin: 0 auto;
    }

    .biblioteca-header h1 {
      color: #1a1a1a;
      letter-spacing: -0.5px;
      margin-bottom: 0.5rem;
    }

    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: white !important;
      border-radius: 12px !important;
    }

    /* Grid Responsivo (CSS Estándar) */
    .ejercicios-grid {
      display: grid;
      gap: 24px;
      grid-template-columns: 1fr;
    }
    
    @media (min-width: 768px) {
      .ejercicios-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (min-width: 1024px) {
      .ejercicios-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .grid-item {
      display: block;
      height: 100%;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 0;
      color: #9e9e9e;
    }

    .loading-state mat-icon, .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
    }
  `]
})
export class BibliotecaEjerciciosPage implements OnInit {
  private ejercicioService = inject(EjercicioService);
  
  ejercicios = this.ejercicioService.ejercicios;
  loading = this.ejercicioService.loading;
  
  searchQuery = '';
  filteredEjercicios = signal(this.ejercicios());

  ngOnInit(): void {
    this.ejercicioService.getEjercicios({ estado: 'PUBLICADO' }).subscribe({
      next: (data) => this.filteredEjercicios.set(data),
      error: (err) => console.error('Error loading exercises', err)
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredEjercicios.set(
      this.ejercicios().filter(e => 
        e.nombre.toLowerCase().includes(query) || 
        e.categoria.toLowerCase().includes(query)
      )
    );
  }
}
