import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, map, of, switchMap, TimeoutError, timeout } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { CarModel } from '../../app/models/car-model';
import { OfferType, OrderCarModel } from '../../app/models/orderCar-model';
import { AuthSessionService } from '../../app/services/auth-session-service';
import { CarService } from '../../app/services/car/car-service';
import { OrderCarRequest, OrderCarService } from '../../app/services/orderCar/order-car-service';

@Component({
  selector: 'app-car-selection',
  imports: [MatButtonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './car-selection.html',
  styleUrl: './car-selection.css',
})
export class CarSelection implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly carService = inject(CarService);
  private readonly orderCarService = inject(OrderCarService);

  protected readonly car = signal<CarModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly pageError = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isEditing = signal(false);

  readonly offerTypes = [
    { value: OfferType.BUY, label: 'Achat' },
    { value: OfferType.RENT, label: 'Location' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    offerType: this.formBuilder.nonNullable.control<OfferType | ''>(
      '',
      Validators.required,
    ),
    hasTradeIn: false,
    tradeBrand: '',
    tradeModel: '',
    tradePrice: this.formBuilder.control<number | null>(null),
    subscriptionInsurance: false,
  });

  private orderId: number | null = null;

  ngOnInit(): void {
    const user = this.authSessionService.getUser();
    const idParam = this.route.snapshot.paramMap.get('id');
    const carId = idParam === null ? Number.NaN : Number(idParam);
    const orderIdParam = this.route.snapshot.paramMap.get('orderId');
    const orderId = orderIdParam === null ? null : Number(orderIdParam);

    if (!user || !Number.isSafeInteger(carId) || carId <= 0) {
      this.pageError.set('Impossible d’ouvrir les choix pour ce véhicule.');
      this.loading.set(false);
      return;
    }

    if (
      orderIdParam !== null &&
      (orderId === null || !Number.isSafeInteger(orderId) || orderId <= 0)
    ) {
      this.pageError.set('La sélection à modifier est invalide.');
      this.loading.set(false);
      return;
    }

    this.orderId = orderId;
    this.carService
      .getCarById(carId)
      .pipe(
        switchMap((car) =>
          orderId === null
            ? of({ car, order: null })
            : this.orderCarService
                .getOrderById(orderId)
                .pipe(map((order) => ({ car, order }))),
        ),
        timeout({ first: 15_000 }),
      )
      .subscribe({
        next: ({ car, order }) => {
          this.car.set(car);
          if (order) {
            if (order.user?.id !== user.id || order.car?.carId !== car.carId) {
              this.pageError.set('Cette sélection ne peut pas être modifiée.');
              this.loading.set(false);
              return;
            }

            this.isEditing.set(true);
            const tradeIn =
              !!order.tradeOldCar?.brand ||
              !!order.tradeOldCar?.model ||
              (order.tradeOldCar?.price ?? 0) > 0;
            this.form.patchValue({
              offerType: order.offerType,
              hasTradeIn: tradeIn,
              tradeBrand: order.tradeOldCar?.brand ?? '',
              tradeModel: order.tradeOldCar?.model ?? '',
              tradePrice: tradeIn ? order.tradeOldCar?.price ?? null : null,
              subscriptionInsurance: order.subscriptionInsurance ?? false,
            });
          }
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.pageError.set(
            error instanceof TimeoutError
              ? 'Le chargement prend trop de temps. Vérifiez votre connexion puis réessayez.'
              : 'Impossible de charger les choix du véhicule.',
          );
          this.loading.set(false);
        },
      });
  }

  save(): void {
    this.errorMessage.set('');
    const car = this.car();
    const user = this.authSessionService.getUser();
    const values = this.form.getRawValue();

    if (!car || !user) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!values.offerType) {
      return;
    }

    if (values.hasTradeIn) {
      this.errorMessage.set(
        'La reprise de véhicule n’est pas encore prise en charge par le serveur.',
      );
      return;
    }

    const carId = car.carId;
    if (typeof carId !== 'number' || !Number.isSafeInteger(carId) || carId <= 0) {
      this.errorMessage.set('L’identifiant du véhicule est invalide.');
      return;
    }

    const order: OrderCarRequest = {
      car: { carId },
      user: { id: user.id },
      offerType: values.offerType,
      subscriptionInsurance: values.subscriptionInsurance,
      tradeOldCar: null,
    };

    const request = this.orderId === null
      ? this.orderCarService.createOrder(order)
      : this.orderCarService.updateOrder(this.orderId, order);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        void this.router.navigateByUrl('/customer-panel').then((navigated) => {
          if (!navigated) {
            this.errorMessage.set('La sélection est enregistrée, mais le retour à votre espace client a échoué.');
          }
        }).catch(() => {
          this.errorMessage.set('La sélection est enregistrée, mais le retour à votre espace client a échoué.');
        });
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getSaveErrorMessage(error));
      },
    });
  }

  private getSaveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body: unknown = error.error;
      const message =
        typeof body === 'string'
          ? body
          : typeof body === 'object' && body !== null && 'message' in body
            ? body.message
            : null;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      return error.status === 0
        ? 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.'
        : `Impossible d’enregistrer la sélection (HTTP ${error.status}).`;
    }

    return 'Une erreur inattendue est survenue pendant l’enregistrement.';
  }
}
