import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { finalize, TimeoutError, timeout } from 'rxjs';
import { ValidateButton } from '../../../Components/validate-button/validate-button';
import { LoginRegisterService } from '../../../app/services/loginRegister/login-register-service';

@Component({
  selector: 'app-register',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ValidateButton,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly loginRegisterService = inject(LoginRegisterService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    lastname: ['', Validators.required],
    firstname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginRegisterService
      .register(this.form.getRawValue())
      .pipe(
        timeout({ first: 90_000 }),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/home', {
            state: { registrationSuccess: true },
          }).then((navigated) => {
            if (!navigated) {
              this.errorMessage = 'Le compte a été créé, mais le retour à l’accueil a échoué.';
            }
          }).catch(() => {
            this.errorMessage = 'Le compte a été créé, mais le retour à l’accueil a échoué.';
          });
        },
        error: (error: unknown) => {
          this.errorMessage = this.getErrorMessage(error);
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return "Le serveur met trop de temps à répondre. Vérifie ta connexion puis réessaie.";
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return "Impossible de joindre le serveur. Vérifie ta connexion et réessaie.";
      }

      const body: unknown = error.error;
      const message =
        typeof body === 'string'
          ? body
          : typeof body === 'object' && body !== null && 'message' in body
            ? body.message
            : '';

      if (
        error.status === 409 ||
        (typeof message === 'string' &&
          /already exists|existe déjà|existe deja|duplicate/i.test(message))
      ) {
        return "L'utilisateur existe déjà.";
      }

      return typeof message === 'string' && message.length > 0
        ? message
        : 'La création du compte a échoué. Réessaie plus tard.';
    }

    return 'Une erreur inattendue est survenue pendant la création du compte.';
  }
}
