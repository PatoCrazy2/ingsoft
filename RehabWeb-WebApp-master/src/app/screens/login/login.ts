import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <main class="auth">
      <div class="auth__panel">
        <h1 class="auth__title">Iniciar sesión</h1>
        <p class="auth__lead">
          Usa la cuenta de <strong>terapeuta</strong> del entorno demo para ver pacientes y ejercicios
          filtrados.
        </p>
        <p class="auth__demo">
          <span>Demo:</span> terapeuta&#64;demo.rehab · demo12345
        </p>

        <form class="auth__form" [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="auth__field">
            <mat-label>Correo</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="username" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="auth__field">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
          </mat-form-field>

          @if (errorMsg()) {
            <p class="auth__error" role="alert">{{ errorMsg() }}</p>
          }

          <button mat-flat-button color="primary" class="auth__submit" type="submit" [disabled]="enviando()">
            @if (enviando()) {
              <mat-spinner diameter="22"></mat-spinner>
            } @else {
              Entrar
            }
          </button>
        </form>

        <a routerLink="/home" class="auth__skip">Volver al inicio</a>
      </div>
    </main>
  `,
  styles: `
    .auth {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 1.5rem 1rem;
      background: linear-gradient(160deg, #f1f5f9 0%, #e0e7ff 45%, #f8fafc 100%);
    }

    .auth__panel {
      width: 100%;
      max-width: 400px;
      padding: 2rem 1.75rem;
      border-radius: 20px;
      background: rgb(255 255 255 / 0.95);
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 50px rgb(15 23 42 / 0.08);
    }

    .auth__title {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--rw-title);
    }

    .auth__lead {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--rw-muted);
    }

    .auth__demo {
      margin: 0 0 1.5rem;
      padding: 0.65rem 0.85rem;
      border-radius: 12px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      font-size: 0.8rem;
      color: #1e40af;
      line-height: 1.45;
    }

    .auth__demo span {
      font-weight: 700;
      display: block;
      margin-bottom: 0.2rem;
    }

    .auth__form {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .auth__field {
      width: 100%;
    }

    .auth__error {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: #b91c1c;
    }

    .auth__submit {
      margin-top: 0.75rem;
      width: 100%;
      height: 48px;
      font-weight: 700 !important;
      border-radius: 12px !important;
    }

    .auth__skip {
      display: block;
      margin-top: 1.25rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
    }

    .auth__skip:hover {
      text-decoration: underline;
    }
  `,
})
export class LoginPlaceholderComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly enviando = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['terapeuta@demo.rehab', [Validators.required, Validators.email]],
    password: ['demo12345', Validators.required],
  });

  onSubmit(): void {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.enviando.set(true);
    this.auth.login(email, password).subscribe({
      next: () => {
        this.enviando.set(false);
        void this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        const d = err.error;
        const nonField =
          d && typeof d === 'object' && 'non_field_errors' in d
            ? (d as { non_field_errors?: string[] }).non_field_errors?.[0]
            : null;
        this.errorMsg.set(
          nonField ?? (typeof d?.detail === 'string' ? d.detail : null) ?? 'Credenciales incorrectas.',
        );
      },
    });
  }
}
