import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { EjercicioService } from '../../services/ejercicio.service';
import { Ejercicio } from '../../models/ejercicio.model';

@Component({
  selector: 'app-admin-ejercicios',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule, 
    MatTooltipModule,
    RouterLink
  ],
  template: `
    <div class="admin-container animate-in">
      <header class="admin-header d-flex justify-content-between align-items-end mb-5">
        <div>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-2">
              <li class="breadcrumb-item"><a routerLink="/ejercicios">Biblioteca</a></li>
              <li class="breadcrumb-item active">Admin</li>
            </ol>
          </nav>
          <h1 class="admin-title">Gestión de Contenido</h1>
          <p class="admin-subtitle">Controla la calidad y publicación del catálogo terapéutico.</p>
        </div>
        <button mat-flat-button color="primary" routerLink="/ejercicios/admin/nuevo" class="add-btn">
          <mat-icon>add</mat-icon> NUEVO EJERCICIO
        </button>
      </header>

      <div class="dashboard-card">
        <div class="table-responsive">
          <table mat-table [dataSource]="ejercicios()" class="w-100">
            
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
                  {{ e.estado.replace('_', ' ') }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="dificultad">
              <th mat-header-cell *matHeaderCellDef>VALORACIÓN</th>
              <td mat-cell *matCellDef="let e"> 
                <div class="d-flex align-items-center">
                   <mat-icon class="me-1 text-warning fs-5">star</mat-icon>
                   <span>{{ e.puntuacion_media || 'N/A' }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>ACCIONES</th>
              <td mat-cell *matCellDef="let e">
                <div class="d-flex gap-2 justify-content-end">
                  <button mat-icon-button class="action-btn" [routerLink]="['/ejercicios/admin', e.id, 'editar']">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button class="action-btn preview" [routerLink]="['/ejercicios/admin', e.id, 'preview']">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  @if (e.estado === 'PENDIENTE_VALIDACION') {
                    <button mat-raised-button color="accent" class="validate-btn" [routerLink]="['/ejercicios/admin', e.id, 'validaciones']">
                      VALIDAR
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
      padding: var(--space-8) var(--space-4);
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

    .breadcrumb-item a {
      text-decoration: none;
      color: var(--color-primary);
      font-size: var(--text-s);
      transition: color var(--duration-base);
      &:hover { color: var(--color-primary-low); }
    }

    .add-btn {
      padding: var(--space-2) var(--space-5);
      border-radius: var(--radius-xl) !important;
      font-weight: var(--font-bold);
      height: 48px;
      background: var(--color-primary);
      transition: transform var(--duration-fast), filter var(--duration-base);
      &:hover { transform: translateY(-1px); filter: brightness(1.1); }
      &:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
    }

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
      border-radius: var(--radius-lg);
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

    .action-btn {
      color: var(--color-text-secondary);
      transition: all var(--duration-base);
      &:hover { background: var(--color-primary-low); color: var(--color-primary); }
      &.preview:hover { color: var(--color-info); }
      &:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
    }

    .validate-btn {
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      padding: 0 var(--space-3) !important;
      height: 32px;
      border-radius: var(--radius-md) !important;
    }
  `]
})
export class AdminEjerciciosPage implements OnInit {
  private readonly ejercicioService = inject(EjercicioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ejercicios = this.ejercicioService.ejercicios;
  displayedColumns: string[] = ['nombre', 'estado', 'dificultad', 'acciones'];

  ngOnInit(): void {
    this.recargar();
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
    void this.auth.asegurarTokenDemo().then(() => {
      this.ejercicioService.getEjercicios().subscribe();
    });
  }
}
