import { afterNextRender, Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EjercicioService } from '../../services/ejercicio.service';
import { Ejercicio } from '../../models/ejercicio.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-ejercicios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
    FormsModule
  ],
  template: `
    <div class="admin-container animate-in">
      <header class="admin-header d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 class="admin-title">Gestión de Contenido</h1>
          <p class="admin-subtitle">Controla la calidad y publicación del catálogo terapéutico.</p>
        </div>
        <button mat-flat-button color="primary" routerLink="/ejercicios/admin/nuevo" class="add-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>NUEVO EJERCICIO</span>
        </button>
      </header>

      <div class="admin-filters mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="search-bar">
              <svg class="search-bar__icon" xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="search" placeholder="Buscar por nombre o categoría..." 
                     [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" />
            </div>
          </div>
          <div class="col-md-3">
            <select class="field__select" [ngModel]="estadoFiltro()" (ngModelChange)="estadoFiltro.set($event)">
              <option value="">Todos los estados</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="PENDIENTE_VALIDACION">Pendiente</option>
              <option value="BORRADOR">Borrador</option>
            </select>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="table-responsive">
          <table mat-table [dataSource]="ejerciciosFiltrados()" class="w-100">
            
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>DETALLES DEL EJERCICIO</th>
              <td mat-cell *matCellDef="let e">
                <div class="exercise-cell py-3">
                  <div class="image-box me-3">
                    <img [src]="e.imagen_url || 'assets/placeholder-exercise.jpg'" alt="">
                  </div>
                  <div>
                    <div class="exercise-name">{{ e.nombre }}</div>
                    <div class="exercise-meta">
                      <span class="category">{{ e.categoria }}</span>
                      <span class="dot">•</span>
                      <span class="diff">{{ e.dificultad }}</span>
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>ESTADO</th>
              <td mat-cell *matCellDef="let e">
                <div class="badge" 
                     [class.badge--published]="e.estado === 'PUBLICADO'"
                     [class.badge--pending]="e.estado === 'PENDIENTE_VALIDACION'"
                     [class.badge--draft]="e.estado === 'BORRADOR'">
                  {{ e.estado?.replace('_', ' ') || 'S/E' }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="dificultad">
              <th mat-header-cell *matHeaderCellDef>VALORACIÓN</th>
              <td mat-cell *matCellDef="let e"> 
                <div class="d-flex align-items-center rating">
                   <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                   <span>{{ e.puntuacion_media || 'N/A' }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>ACCIONES</th>
              <td mat-cell *matCellDef="let e">
                <div class="d-flex gap-2 justify-content-end align-items-center h-100">
                  @if (e.estado === 'PENDIENTE_VALIDACION') {
                    <button class="btn-validate-elegant" [routerLink]="['/ejercicios/admin', e.id, 'validaciones']">
                      Validar ahora
                    </button>
                  } @else {
                    <button class="icon-action-btn" [routerLink]="['/ejercicios/admin', e.id, 'editar']" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-action-btn preview" [routerLink]="['/ejercicios/admin', e.id, 'preview']" title="Ver Detalle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: var(--space-4) var(--space-4);
    }

    .admin-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .admin-subtitle {
      font-size: var(--text-m);
      color: var(--color-text-secondary);
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-5);
      border-radius: var(--radius-xl);
      font-weight: var(--font-bold);
      background: var(--color-primary);
      color: white;
      border: none;
      cursor: pointer;
      transition: transform var(--duration-fast), filter var(--duration-base);
      &:hover { transform: translateY(-1px); filter: brightness(1.1); }
    }

    .btn-svg { width: 18px; height: 18px; }

    .dashboard-card {
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .mat-mdc-table { background: transparent; }
    
    .mat-mdc-header-cell {
      background: var(--color-bg-app);
      color: var(--color-text-secondary);
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      letter-spacing: var(--tracking-wide);
      padding: var(--space-3) var(--space-4);
    }

    .table-row {
      transition: background var(--duration-base) var(--easing-default);
      &:hover { background: var(--color-bg-app); }
    }

    .exercise-cell {
      display: flex;
      align-items: center;
      padding: var(--space-2) var(--space-4);
    }

    .image-box {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-border);
    }

    .image-box img { width: 100%; height: 100%; object-fit: cover; }

    .exercise-name {
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      font-size: var(--text-m);
    }

    .exercise-meta {
      font-size: var(--text-s);
      color: var(--color-text-secondary);
      .dot { margin: 0 var(--space-1); opacity: 0.5; }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-pill);
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);

      &--published { background: var(--color-primary-low); color: var(--color-primary); }
      &--pending { 
        background: #FFF8E6; color: var(--color-warning); 
        animation: pulse-glow 2s infinite;
      }
      &--draft { 
        background: var(--color-bg-app); 
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border);
      }
    }

    .rating {
      color: var(--color-text-primary);
      font-weight: var(--font-medium);
      gap: 4px;
    }
    .star-icon { width: 16px; height: 16px; color: var(--color-warning); }

    .icon-action-btn {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      padding: 6px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--duration-base);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover { background: var(--color-primary-low); color: var(--color-primary); border-color: var(--color-primary); }
      &.preview:hover { color: var(--color-info); border-color: var(--color-info); background: #EBF2FF; }
    }
    .action-svg { width: 18px; height: 18px; }

    .btn-validate-elegant {
      background: var(--color-primary-low);
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      padding: 0 var(--space-3);
      height: 28px;
      border-radius: var(--radius-pill);
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      cursor: pointer;
      transition: all var(--duration-base);
      white-space: nowrap;
      &:hover { background: var(--color-primary); color: white; transform: translateY(-1px); }
    }

    $control-height: 40px;

    input[type="search"] {
      display: block;
      width: 100%;
      height: $control-height;
      padding: 0 var(--space-3);
      font-family: var(--font-family);
      font-size: var(--text-s);
      color: var(--color-text-primary);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      outline: none;
      transition: all var(--duration-base);

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(0, 167, 129, 0.15);
      }
    }

    .field__select {
      display: block;
      width: 100%;
      height: $control-height;
      padding: 0 var(--space-6) 0 var(--space-3);
      font-family: var(--font-family);
      font-size: var(--text-s);
      background-color: var(--color-bg-card);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23707E8C' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right var(--space-3) center;
      background-size: 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      appearance: none;
      outline: none;
      cursor: pointer;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;

      &__icon {
        position: absolute;
        left: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: var(--color-text-muted);
        pointer-events: none;
        z-index: 1;
      }

      input {
        padding-left: calc(var(--space-3) + 18px + var(--space-2));
        border-radius: var(--radius-pill);
      }
    }
  `]
})
export class AdminEjerciciosPage implements OnInit {
  private readonly ejercicioService = inject(EjercicioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.recargar());
  }

  ejercicios = this.ejercicioService.ejercicios;
  searchTerm = signal('');
  estadoFiltro = signal('');
  
  ejerciciosFiltrados = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const estado = this.estadoFiltro();
    const lista = this.ejercicios();

    return lista.filter(e => {
      const matchesTerm = !term || 
        e.nombre.toLowerCase().includes(term) || 
        (e.categoria ?? '').toLowerCase().includes(term);
      const matchesEstado = !estado || e.estado === estado;
      return matchesTerm && matchesEstado;
    });
  });

  displayedColumns: string[] = ['nombre', 'estado', 'dificultad', 'acciones'];

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const path = this.router.url.split('?')[0];
        if (path === '/ejercicios/admin') {
          this.recargar();
        }
      });
  }

  private recargar(): void {
    void this.auth.asegurarSesion().then(() => {
      this.ejercicioService.getEjercicios().subscribe();
    });
  }
}
