import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly router = inject(Router);
  readonly registrationSuccess = this.hasRegistrationSuccess();

  private hasRegistrationSuccess(): boolean {
    const navigationState = this.router.getCurrentNavigation()?.extras.state;

    return (
      navigationState?.['registrationSuccess'] === true ||
      (typeof history !== 'undefined' &&
        history.state?.['registrationSuccess'] === true)
    );
  }
}
