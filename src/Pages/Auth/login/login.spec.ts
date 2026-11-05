import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Login } from './login';
import { AuthSessionService } from '../../../app/services/auth-session-service';
import { LoginRegisterService } from '../../../app/services/loginRegister/login-register-service';
import { Router } from '@angular/router';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let loginRegisterService: { login: ReturnType<typeof vi.fn> };
  let authSessionService: { setSession: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    loginRegisterService = { login: vi.fn() };
    authSessionService = { setSession: vi.fn() };
    router = { navigateByUrl: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: LoginRegisterService, useValue: loginRegisterService },
        { provide: AuthSessionService, useValue: authSessionService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save a custom user and return to home', () => {
    const user = {
      id: 8,
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'jean@example.com',
      role: 'Custom',
    };
    const response = { user, token: 'custom-token' };
    loginRegisterService.login.mockReturnValue(of(response));
    authSessionService.setSession.mockReturnValue(user);
    component.form.setValue({
      email: user.email,
      password: 'password123',
    });

    component.submit();

    expect(authSessionService.setSession).toHaveBeenCalledWith(user, 'custom-token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('should save an admin user and return to home', () => {
    const user = {
      id: 2,
      firstname: 'Ada',
      lastname: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
    };
    const response = { user, token: 'admin-token' };
    loginRegisterService.login.mockReturnValue(of(response));
    authSessionService.setSession.mockReturnValue({ ...user, role: 'Admin' });
    component.form.setValue({
      email: user.email,
      password: 'password123',
    });

    component.submit();

    expect(authSessionService.setSession).toHaveBeenCalledWith(user, 'admin-token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });
});
