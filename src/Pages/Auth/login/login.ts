import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { finalize, TimeoutError, timeout } from 'rxjs';
import { ValidateButton } from '../../../Components/validate-button/validate-button';
import { LoginRegisterService } from '../../../app/services/loginRegister/login-register-service';
import { AuthSessionService } from '../../../app/services/auth-session-service';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ValidateButton,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly loginRegisterService = inject(LoginRegisterService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  isSubmitting = false;
  errorMessage = '';

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginRegisterService
      .login(this.form.getRawValue())
      .pipe(
        timeout({ first: 30_000 }),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: (user) => {
          try {
            this.authSessionService.setSession(user.user, user.token);
            void this.router.navigateByUrl('/home').then((navigated) => {
              if (!navigated) {
                this.errorMessage = 'Connexion réussie, mais le retour à l’accueil a échoué.';
              }
            }).catch(() => {
              this.errorMessage = 'Connexion réussie, mais le retour à l’accueil a échoué.';
            });
          } catch (error: unknown) {
            this.errorMessage =
              error instanceof Error
                ? error.message
                : 'Impossible d’ouvrir votre espace client.';
          }
        },
        error: (error: unknown) => {
          this.errorMessage = this.getErrorMessage(error);
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return "Le serveur n’a pas répondu après 30 secondes. Vérifie son état et la configuration CORS, puis réessaie.";
    }

    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      const body: unknown = error.error;
      const message =
        typeof body === 'string'
          ? body
          : typeof body === 'object' && body !== null && 'message' in body
            ? body.message
            : '';

      return typeof message === 'string' && message.length > 0
        ? message
        : error.status === 0
          ? "Impossible de joindre l'API depuis le navigateur. Vérifie l'URL et la configuration CORS."
          : `La connexion a échoué (HTTP ${error.status}). Vérifie tes identifiants puis réessaie.`;
    }

    return 'Une erreur inattendue est survenue pendant la connexion.';
  }
}
