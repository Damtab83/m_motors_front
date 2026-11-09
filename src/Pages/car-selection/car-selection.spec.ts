import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CarSelection } from './car-selection';
import { CarModel } from '../../app/models/car-model';
import { AuthSessionService } from '../../app/services/auth-session-service';
import { CarService } from '../../app/services/car/car-service';
import { OrderCarService } from '../../app/services/orderCar/order-car-service';
import { OfferType } from '../../app/models/orderCar-model';

describe('CarSelection', () => {
  let fixture: ComponentFixture<CarSelection>;
  let component: CarSelection;
  let orderCarService: {
    createOrder: ReturnType<typeof vi.fn>;
    getOrderById: ReturnType<typeof vi.fn>;
    updateOrder: ReturnType<typeof vi.fn>;
  };
  const car: CarModel = {
    carId: 2,
    brand: 'Mercedes',
    model: 'Classe A',
    motorisation: '150CV',
    kilometer: 12800,
    price: 25000,
    testDriving: null,
  };
  const user = {
    id: 11,
    firstname: 'Jean',
    lastname: 'Client',
    email: 'client@example.com',
    role: 'Custom' as const,
  };
  const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };

  beforeEach(async () => {
    vi.clearAllMocks();
    orderCarService = {
      createOrder: vi.fn().mockReturnValue(of({ id: 1 })),
      getOrderById: vi.fn(),
      updateOrder: vi.fn().mockReturnValue(of({ id: 1 })),
    };

    await TestBed.configureTestingModule({
      imports: [CarSelection],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (name: string) => name === 'id' ? '2' : null } } },
        },
        { provide: Router, useValue: router },
        { provide: AuthSessionService, useValue: { getUser: () => user } },
        { provide: CarService, useValue: { getCarById: vi.fn().mockReturnValue(of(car)) } },
        { provide: OrderCarService, useValue: orderCarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the car and save the selected options as a new order', () => {
    component.form.setValue({
      offerType: OfferType.BUY,
      hasTradeIn: false,
      tradeBrand: '',
      tradeModel: '',
      tradePrice: null,
      subscriptionInsurance: true,
    });

    component.save();

    expect(orderCarService.createOrder).toHaveBeenCalledWith({
      car: { carId: car.carId },
      user: { id: user.id },
      offerType: 'BUY',
      subscriptionInsurance: true,
      tradeOldCar: null,
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/customer-panel');
  });

  it('should explain that trade-in is not supported by the API', () => {
    component.form.controls.offerType.setValue(OfferType.BUY);
    component.form.controls.hasTradeIn.setValue(true);
    component.save();
    fixture.detectChanges();

    expect(orderCarService.createOrder).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'La reprise de véhicule n’est pas encore prise en charge par le serveur.',
    );
  });

  it('should display an API error when saving the selection fails', () => {
    component.form.controls.offerType.setValue(OfferType.BUY);
    orderCarService.createOrder.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'Données de commande invalides.' },
          }),
      ),
    );

    component.save();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Données de commande invalides.',
    );
    expect(router.navigateByUrl).not.toHaveBeenCalledWith('/customer-panel');
  });
});
