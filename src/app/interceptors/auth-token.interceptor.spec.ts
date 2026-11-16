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
    http.post(`${environment.apiUrl}/commande`, {}).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/commande`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({});
  });

  it.each([
    `${environment.apiUrl}/client`,
    `${environment.apiUrl}/client/1`,
    `${environment.apiUrl}/voiture`,
    `${environment.apiUrl}/voiture/1`,
  ])('should not attach the bearer token to public reads: %s', (url) => {
    http.get(url).subscribe();

    const request = httpTestingController.expectOne(url);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('should keep the bearer token on car writes', () => {
    http.post(`${environment.apiUrl}/voiture`, {}).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/voiture`);
    expect(request.request.headers.has('Authorization')).toBe(true);
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
