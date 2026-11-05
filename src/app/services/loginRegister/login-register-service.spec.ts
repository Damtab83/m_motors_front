import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { LoginRegisterService } from './login-register-service';
import { environment } from '../../../environments/environment';
import { UserRole } from '../../models/user-model';

describe('LoginRegisterService', () => {
  let service: LoginRegisterService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LoginRegisterService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login credentials to the API', () => {
    const credentials = { email: 'client@example.com', password: 'password123' };
    const response = {
      token: 'sample-token',
      user: {
        id: 1,
        firstname: 'Jean',
        lastname: 'Dupont',
        email: credentials.email,
        role: UserRole.CUSTOM,
      },
    };

    service.login(credentials).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/connexion`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(response);
  });

  it('should accept a direct UserCustom response without a token', () => {
    let responseError: unknown;
    service.login({ email: 'client@example.com', password: 'password123' }).subscribe({
      next: (result) => {
        expect(result).toEqual({
          user: {
            id: 7,
            firstname: 'Jean',
            lastname: 'Client',
            email: 'client@example.com',
            role: 'ROLE_CUSTOM',
          },
        });
      },
      error: (error: unknown) => {
        responseError = error;
      },
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/connexion`,
    );
    request.flush({
      id: 7,
      firstname: 'Jean',
      lastname: 'Client',
      email: 'client@example.com',
      role: 'ROLE_CUSTOM',
    });

    expect(responseError).toBeUndefined();
  });

  it('should accept a UserCustom response using userCustomId', () => {
    let result: unknown;
    service.login({ email: 'client@example.com', password: 'password123' }).subscribe({
      next: (response) => {
        result = response;
      },
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/connexion`,
    );
    request.flush({
      userCustomId: 7,
      firstname: 'Jean',
      lastname: 'Client',
      email: 'client@example.com',
      role: 'ROLE_CUSTOM',
    });

    expect(result).toEqual({
      user: {
        id: 7,
        firstname: 'Jean',
        lastname: 'Client',
        email: 'client@example.com',
        role: 'ROLE_CUSTOM',
      },
    });
  });

  it('should normalize a wrapped client profile with conventional name casing', () => {
    let result: unknown;
    service.login({ email: 'client@example.com', password: 'password123' }).subscribe({
      next: (response) => {
        result = response;
      },
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/connexion`,
    );
    request.flush({
      client: {
        userId: '7',
        firstName: 'Jean',
        lastName: 'Client',
        email: 'client@example.com',
        role: 'ROLE_CUSTOM',
      },
    });

    expect(result).toEqual({
      user: {
        id: 7,
        firstname: 'Jean',
        lastname: 'Client',
        email: 'client@example.com',
        role: 'ROLE_CUSTOM',
      },
    });
  });

  it('should read an authorization token from the response header', () => {
    let result: unknown;
    service.login({ email: 'client@example.com', password: 'password123' }).subscribe({
      next: (response) => {
        result = response;
      },
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/connexion`,
    );
    request.flush(
      {
        id: 7,
        firstname: 'Jean',
        lastname: 'Client',
        email: 'client@example.com',
        role: 'ROLE_CUSTOM',
      },
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer sample-token',
        }),
      },
    );

    expect(result).toEqual({
      token: 'sample-token',
      user: {
        id: 7,
        firstname: 'Jean',
        lastname: 'Client',
        email: 'client@example.com',
        role: 'ROLE_CUSTOM',
      },
    });
  });

  it('should accept UserCustom wrapped with its token', () => {
    let result: unknown;
    service.login({ email: 'client@example.com', password: 'password123' }).subscribe({
      next: (response) => {
        result = response;
      },
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/connexion`,
    );
    request.flush({
      token: 'sample-token',
      userCustom: {
        id: 7,
        firstname: 'Jean',
        lastname: 'Client',
        email: 'client@example.com',
        role: 'ROLE_CUSTOM',
      },
    });

    expect(result).toEqual({
      token: 'sample-token',
      user: {
        id: 7,
        firstname: 'Jean',
        lastname: 'Client',
        email: 'client@example.com',
        role: 'ROLE_CUSTOM',
      },
    });
  });

  it('should accept a plain-text registration response from the API', () => {
    const registrationData = {
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'client@example.com',
      password: 'password123',
    };

    service.register(registrationData).subscribe((response) => {
      expect(response.status).toBe(200);
      expect(response.body).toBe('Utilisateur enregistré');
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/inscription`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registrationData);
    request.flush('Utilisateur enregistré', {
      status: 200,
      statusText: 'OK',
    });
  });
});
