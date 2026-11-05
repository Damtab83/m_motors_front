import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpResponse,
  provideHttpClient,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Register } from './register';
import { LoginRegisterService } from '../../../app/services/loginRegister/login-register-service';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let loginRegisterService: { register: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    loginRegisterService = {
      register: vi.fn(),
    };
    router = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideHttpClient(),
        { provide: LoginRegisterService, useValue: loginRegisterService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate home after a successful registration with status 201', () => {
    loginRegisterService.register.mockReturnValue(
      of(new HttpResponse({ status: 201 })),
    );
    component.form.setValue({
      lastname: 'Dupont',
      firstname: 'Jean',
      email: 'jean@example.com',
      password: 'password123',
    });

    component.submit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/home', {
      state: { registrationSuccess: true },
    });
    expect(component.isSubmitting).toBe(false);
  });

  it('should stay on the form and show a message when the user already exists', () => {
    loginRegisterService.register.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'User already exists' },
          }),
      ),
    );
    component.form.setValue({
      lastname: 'Dupont',
      firstname: 'Jean',
      email: 'jean@example.com',
      password: 'password123',
    });

    component.submit();

    expect(component.errorMessage).toBe("L'utilisateur existe déjà.");
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });
});
