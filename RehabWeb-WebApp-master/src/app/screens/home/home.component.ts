import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { EjercicioService } from '../../features/ejercicios/services/ejercicio.service';
import { PacienteService } from '../../features/rutinas/services/paciente';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private ejerciciosService = inject(EjercicioService);
  private pacienteService = inject(PacienteService);

  userRole = this.auth.role;
  isAdmin = computed(() => this.userRole() === 'Admin');
  isTerapeuta = computed(() => this.userRole() === 'Terapeuta');
  isPaciente = computed(() => this.userRole() === 'Paciente');

  stats = signal<{
    totalEjercicios: number;
    pendientes: number;
    pacientesActivos: number;
    rutinasAsignadas: number;
  }>({
    totalEjercicios: 0,
    pendientes: 0,
    pacientesActivos: 0,
    rutinasAsignadas: 0
  });

  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading.set(true);
    
    const filtroCatalogo = this.isPaciente()
      ? { estado: 'PUBLICADO' as const }
      : undefined;

    const calls = {
      ejercicios: this.ejerciciosService
        .getEjercicios(filtroCatalogo)
        .pipe(catchError(() => of([]))),
      pacientes: this.isTerapeuta()
        ? this.pacienteService.listar().pipe(catchError(() => of([])))
        : of([]),
    };

    forkJoin(calls).subscribe({
      next: (res) => {
        const ejercicios = res.ejercicios;
        const pacientes = res.pacientes;

        this.stats.set({
          totalEjercicios: ejercicios.length,
          pendientes: ejercicios.filter((e) => e.estado === 'PENDIENTE_VALIDACION').length,
          pacientesActivos: pacientes.length,
          rutinasAsignadas: this.isPaciente()
            ? 1
            : Math.floor(pacientes.length * 0.8),
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
