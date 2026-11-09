import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { OrderCarModel, OfferType } from '../../../app/models/orderCar-model';
import { AuthenticatedUser, AuthSessionService } from '../../../app/services/auth-session-service';
import { UserService } from '../../../app/services/user/user-service';

@Component({
  selector: 'app-customer-panel',
  imports: [RouterLink],
  templateUrl: './customer-panel.html',
  styleUrl: './customer-panel.css',
})
export class CustomerPanel implements OnInit {
  private readonly authSessionService = inject(AuthSessionService);
  private readonly userService = inject(UserService);

  protected readonly customer = signal<AuthenticatedUser | null>(null);
  protected readonly orders = signal<OrderCarModel[]>([]);
  protected readonly selectedOrderIndex = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    const sessionCustomer = this.authSessionService.getUser();
    if (!sessionCustomer) {
      this.errorMessage.set('Connectez-vous pour accéder à votre espace client.');
      this.isLoading.set(false);
      return;
    }

    this.userService
      .getUserById(sessionCustomer.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (user) => {
          this.customer.set({
            id: user.id ?? sessionCustomer.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: sessionCustomer.role,
          });
          this.orders.set(Array.isArray(user.ordersCars) ? user.ordersCars : []);
        },
        error: () => {
          this.errorMessage.set(
            'Impossible de charger votre dossier client. Veuillez réessayer plus tard.',
          );
        },
      });
  }

  protected toggleOrderDetails(index: number): void {
    this.selectedOrderIndex.update((selectedIndex) =>
      selectedIndex === index ? null : index,
    );
  }

  protected offerLabel(offerType: OfferType): string {
    switch (offerType) {
      case OfferType.BUY:
        return 'Achat';
      case OfferType.RENT:
        return 'Location';
      default:
        return 'Type d’offre indisponible';
    }
  }
}
