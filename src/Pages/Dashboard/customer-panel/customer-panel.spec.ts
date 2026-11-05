import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CustomerPanel } from './customer-panel';
import { OfferType } from '../../../app/models/orderCar-model';
import { UserModel, UserRole } from '../../../app/models/user-model';
import { AuthSessionService, AuthenticatedUser } from '../../../app/services/auth-session-service';
import { UserService } from '../../../app/services/user/user-service';

describe('CustomerPanel', () => {
  let component: CustomerPanel;
  let fixture: ComponentFixture<CustomerPanel>;
  let userService: { getUserById: ReturnType<typeof vi.fn> };
  const sessionCustomer: AuthenticatedUser = {
    id: 8,
    firstname: 'Jean',
    lastname: 'Dupont',
    email: 'jean@example.com',
    role: 'Custom',
  };

  beforeEach(async () => {
    const orderOwner: UserModel = {
      ...sessionCustomer,
      password: '',
      role: UserRole.CUSTOM,
    };
    const user: UserModel = {
      ...orderOwner,
      ordersCars: [
        {
          id: 12,
          car: {
            carId: 3,
            brand: 'Renault',
            model: 'Clio',
            motorisation: 'Essence',
            kilometer: 12000,
            price: 15000,
            testDriving: true,
          },
          tradeOldCar: {
            brand: '',
            model: '',
            price: 0,
          },
          subscriptionInsurance: false,
          offerType: OfferType.Buy,
          user: orderOwner,
          testDriving: {
            dateTime: '2026-11-05T10:00:00',
            confirmed: true,
          },
        },
      ],
    };
    userService = {
      getUserById: vi.fn().mockReturnValue(of(user)),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerPanel],
      providers: [
        {
          provide: AuthSessionService,
          useValue: { getUser: () => sessionCustomer },
        },
        { provide: UserService, useValue: userService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the current customer and display their selected car', () => {
    fixture.detectChanges();

    expect(userService.getUserById).toHaveBeenCalledWith(sessionCustomer.id);
    expect(fixture.nativeElement.textContent).toContain('jean@example.com');
    expect(fixture.nativeElement.textContent).toContain('Renault Clio');
    expect(fixture.nativeElement.textContent).toContain('Achat');
  });

  it('should show vehicle details and the planned test drive when requested', () => {
    fixture.detectChanges();
    const detailsButton = fixture.nativeElement.querySelector(
      '.order-summary button',
    ) as HTMLButtonElement;

    detailsButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Essence');
    expect(fixture.nativeElement.textContent).toContain('2026-11-05T10:00:00');
    expect(fixture.nativeElement.textContent).toContain('Confirmé');
  });
});
