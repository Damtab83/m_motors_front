import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthSessionService } from '../services/auth-session-service';
import { authTokenInterceptor } from './auth-token.interceptor';
import { environment } from '../../environments/environment';

describe('authTokenInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthSessionService,
          useValue: { getToken: () => 'test-token' },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should attach the bearer token to API requests', () => {
    http.get(`${environment.apiUrl}/client/1`).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/client/1`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({});
  });

  it('should not attach the bearer token to the login request', () => {
    http.post(`${environment.apiUrl}/authentification/connexion`, {}).subscribe();

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/authentification/connexion`,
    );
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
