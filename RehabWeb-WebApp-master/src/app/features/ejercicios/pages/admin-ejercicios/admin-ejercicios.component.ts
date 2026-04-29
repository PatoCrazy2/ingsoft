import { afterNextRender, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EjercicioService } from '../../services/ejercicio.service';

@Component({
  selector: 'app-admin-ejercicios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './admin-ejercicios.component.html',
  styleUrl: './admin-ejercicios.component.scss',
})
export class AdminEjerciciosPage implements OnInit {
  private readonly ejercicioService = inject(EjercicioService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ejercicios = this.ejercicioService.ejercicios;
  displayedColumns: string[] = ['nombre', 'estado', 'dificultad', 'acciones'];

  ngOnInit(): void {
    afterNextRender(() => this.recargar());
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
    this.ejercicioService.getEjercicios().subscribe();
  }
}
