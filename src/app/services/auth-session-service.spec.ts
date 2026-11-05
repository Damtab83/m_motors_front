import { TestBed } from '@angular/core/testing';
import { AuthSessionService } from './auth-session-service';
import { LoginUser } from './loginRegister/login-register-service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSessionService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should normalize and persist an admin role without storing the password', () => {
    const user: LoginUser = {
      id: 1,
      firstname: 'Ada',
      lastname: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    expect(service.setSession(user, 'admin-token')).toEqual({
      id: 1,
      firstname: 'Ada',
      lastname: 'Admin',
      email: 'admin@example.com',
      role: 'Admin',
    });
    expect(sessionStorage.getItem('my-motors-user')).not.toContain('admin-token');
    expect(service.getToken()).toBe('admin-token');
    expect(service.getUser()?.role).toBe('Admin');
  });

  it('should normalize the custom role returned by the API', () => {
    const user: LoginUser = {
      id: 2,
      firstname: 'Jean',
      lastname: 'Client',
      email: 'client@example.com',
      role: 'ROLE_CUSTOM',
    };

    expect(service.setSession(user).role).toBe('Custom');
    expect(service.getUser()?.role).toBe('Custom');
    expect(service.getToken()).toBeNull();
  });

  it('should reject a login response with an unsupported role', () => {
    const user: LoginUser = {
      id: 3,
      firstname: 'Unknown',
      lastname: 'Role',
      email: 'unknown@example.com',
      role: 'Guest',
    };

    expect(() => service.setSession(user, 'token')).toThrow('rôle');
  });
});
