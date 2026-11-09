import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavMenu } from './nav-menu';
import { AuthenticatedUser, AuthSessionService } from '../../app/services/auth-session-service';

describe('NavMenu', () => {
  let component: NavMenu;
  let fixture: ComponentFixture<NavMenu>;
  let authenticatedUser: AuthenticatedUser | null;
  let authSessionService: { getUser: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authenticatedUser = null;
    authSessionService = {
      getUser: vi.fn(() => authenticatedUser),
      clear: vi.fn(() => {
        authenticatedUser = null;
      }),
    };

    await TestBed.configureTestingModule({
      imports: [NavMenu],
      providers: [
        provideRouter([]),
        { provide: AuthSessionService, useValue: authSessionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show login and registration links when signed out', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Connexion');
    expect(text).toContain('Inscription');
    expect(text).not.toContain('Mon compte');
    expect(text).not.toContain('Déconnexion');
  });

  it('should show account and logout links when signed in', () => {
    fixture.destroy();
    authenticatedUser = {
      id: 8,
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'jean@example.com',
      role: 'Custom',
    };
    fixture = TestBed.createComponent(NavMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Mon compte');
    expect(text).toContain('Déconnexion');
    expect(text).not.toContain('Connexion');
    expect(text).not.toContain('Inscription');
  });
});
