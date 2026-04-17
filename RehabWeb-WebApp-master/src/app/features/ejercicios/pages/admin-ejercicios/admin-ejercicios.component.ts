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
    <div class="admin-container">
      <header class="admin-header d-flex justify-content-between align-items-end mb-5">
        <div>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-2">
              <li class="breadcrumb-item"><a routerLink="/ejercicios">Biblioteca</a></li>
              <li class="breadcrumb-item active">Admin</li>
            </ol>
          </nav>
          <h1 class="display-6 fw-bold mb-0">Gestión de Contenido</h1>
          <p class="text-secondary mb-0">Controla la calidad y publicación del catálogo terapéutico.</p>
        </div>
        <button mat-flat-button color="primary" routerLink="/ejercicios/admin/nuevo" class="add-btn">
          <mat-icon>add</mat-icon> NUEVO EJERCICIO
        </button>
      </header>

      <div class="dashboard-card shadow-sm">
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
                <div class="status-pill" [ngClass]="e.estado.toLowerCase()">
                  <div class="status-indicator"></div>
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
      padding: 3rem 2rem;
    }

    .breadcrumb-item a {
      text-decoration: none;
      color: var(--primary-color);
      font-size: 0.9rem;
    }

    .add-btn {
      padding: 0.5rem 1.5rem;
      border-radius: 12px !important;
      font-weight: 600;
      height: 48px;
    }

    .dashboard-card {
      background: white;
      border-radius: 20px;
      border: 1px solid #eef2f6;
      overflow: hidden;
    }

    .mat-mdc-table { background: transparent; }
    
    .mat-mdc-header-cell {
      background: #f8fafc;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 1rem 1.5rem;
    }

    .table-row {
      transition: background 0.2s;
    }
    
    .table-row:hover {
      background: #f1f5f9;
    }

    .exercise-cell {
      display: flex;
      align-items: center;
      padding: 0.5rem 1.5rem;
    }

    .image-box {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      overflow: hidden;
      background: #f1f5f9;
    }

    .image-box img { width: 100%; height: 100%; object-fit: cover; }

    .exercise-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 1rem;
    }

    .exercise-meta {
      font-size: 0.8rem;
      color: #64748b;
    }

    .exercise-meta .dot { margin: 0 5px; opacity: 0.5; }

    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
      
    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-pill.borrador {
      background: #f1f5f9; color: #475569;
    }
    .status-pill.borrador .status-indicator { background: #64748b; }

    .status-pill.pendiente_validacion {
      background: #fefce8; color: #854d0e;
    }
    .status-pill.pendiente_validacion .status-indicator { background: #eab308; }

    .status-pill.publicado {
      background: #f0fdf4; color: #166534;
    }
    .status-pill.publicado .status-indicator { background: #22c55e; }

    .action-btn {
      color: #64748b;
    }
    
    .action-btn:hover { background: #e2e8f0; color: #1e293b; }
    
    .action-btn.preview:hover { color: #4f46e5; }

    .validate-btn {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0 12px !important;
      height: 32px;
      border-radius: 8px !important;
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
