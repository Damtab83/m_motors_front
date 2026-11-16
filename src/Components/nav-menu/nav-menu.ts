import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthenticatedUser, AuthSessionService } from '../../app/services/auth-session-service';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css',
})
export class NavMenu {
  private readonly authSessionService = inject(AuthSessionService);

  myYear = new Date().getFullYear();
  protected menuOpen = false;

  get currentUser(): AuthenticatedUser | null {
    return this.authSessionService.getUser();
  }

  get dashboardLink(): string | null {
    const user = this.currentUser;
    if (!user) {
      return null;
    }

    return user.role === 'Admin'
      ? '/admin-application-panel'
      : '/customer-panel';
  }

  logout(): void {
    this.authSessionService.clear();
    this.closeMenu();
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  protected closeMenu(): void {
    this.menuOpen = false;
  }
}
