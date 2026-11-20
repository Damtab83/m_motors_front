import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { OrderCarModel, OfferType } from '../../../app/models/orderCar-model';
import { AuthenticatedUser, AuthSessionService } from '../../../app/services/auth-session-service';
import { TestDriveService } from '../../../app/services/test-drive/test-drive-service';
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
  private readonly testDriveService = inject(TestDriveService);

  protected readonly customer = signal<AuthenticatedUser | null>(null);
  protected readonly orders = signal<OrderCarModel[]>([]);
  protected readonly selectedOrderIndex = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly warningMessage = signal('');
  protected readonly testDriveOrderId = signal<number | null>(null);
  protected readonly testDriveDate = signal('');
  protected readonly testDriveSaving = signal(false);
  protected readonly testDriveError = signal('');
  protected readonly testDriveSuccessOrderId = signal<number | null>(null);

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
          this.customer.set(sessionCustomer);
          this.warningMessage.set(
            'Votre profil est affiché depuis la session, mais le serveur n’a pas pu charger vos commandes.',
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

  protected openTestDriveForm(orderId: number): void {
    this.testDriveOrderId.set(orderId);
    this.testDriveDate.set('');
    this.testDriveError.set('');
    this.testDriveSuccessOrderId.set(null);
  }

  protected closeTestDriveForm(): void {
    if (this.testDriveSaving()) {
      return;
    }

    this.testDriveOrderId.set(null);
    this.testDriveDate.set('');
    this.testDriveError.set('');
  }

  protected updateTestDriveDate(event: Event): void {
    this.testDriveDate.set((event.target as HTMLInputElement).value);
    this.testDriveError.set('');
  }

  protected requestTestDrive(order: OrderCarModel): void {
    const orderId = order.id;
    const carId = order.car?.carId;
    const testDate = this.testDriveDate();

    if (orderId === undefined || carId === undefined) {
      this.testDriveError.set('Impossible d’identifier la commande ou la voiture.');
      return;
    }
    if (!testDate) {
      this.testDriveError.set('Veuillez choisir une date et une heure.');
      return;
    }
    if (this.testDriveSaving()) {
      return;
    }

    this.testDriveError.set('');
    this.testDriveSaving.set(true);
    this.testDriveService.createTestDrive({ testDate, confirmed: false, carId }).subscribe({
      next: () => {
        this.testDriveSaving.set(false);
        this.testDriveOrderId.set(null);
        this.testDriveDate.set('');
        this.testDriveSuccessOrderId.set(orderId);
      },
      error: () => {
        this.testDriveSaving.set(false);
        this.testDriveError.set('Impossible d’enregistrer la demande d’essai. Réessayez.');
      },
    });
  }
}
