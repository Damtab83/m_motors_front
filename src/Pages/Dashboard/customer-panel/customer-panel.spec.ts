import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CustomerPanel } from './customer-panel';
import { OfferType } from '../../../app/models/orderCar-model';
import { UserModel, UserRole } from '../../../app/models/user-model';
import { AuthSessionService, AuthenticatedUser } from '../../../app/services/auth-session-service';
import { TestDriveService } from '../../../app/services/test-drive/test-drive-service';
import { UserService } from '../../../app/services/user/user-service';

describe('CustomerPanel', () => {
  let component: CustomerPanel;
  let fixture: ComponentFixture<CustomerPanel>;
  let userService: { getUserById: ReturnType<typeof vi.fn> };
  let testDriveService: { createTestDrive: ReturnType<typeof vi.fn> };
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
          offerType: OfferType.BUY,
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
    testDriveService = {
      createTestDrive: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerPanel],
      providers: [
        provideRouter([]),
        {
          provide: AuthSessionService,
          useValue: { getUser: () => sessionCustomer },
        },
        { provide: UserService, useValue: userService },
        { provide: TestDriveService, useValue: testDriveService },
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
    const editLink = fixture.nativeElement.querySelector(
      '.order-summary .action-button',
    ) as HTMLAnchorElement;
    expect(editLink.getAttribute('href')).toBe('/car/3/selection/12');
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

  it('should keep the session profile visible if the client endpoint fails', () => {
    userService.getUserById.mockReturnValue(throwError(() => new Error('Backend failure')));
    fixture.destroy();
    fixture = TestBed.createComponent(CustomerPanel);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('jean@example.com');
    expect(fixture.nativeElement.textContent).toContain(
      'le serveur n’a pas pu charger vos commandes',
    );
  });

  it('should let the customer request a test drive for an eligible car', () => {
    userService.getUserById.mockReturnValue(
      of({
        ...sessionCustomer,
        password: '',
        ordersCars: [
          {
            id: 21,
            car: {
              carId: 7,
              brand: 'Peugeot',
              model: '208',
              motorisation: 'Essence',
              kilometer: 5000,
              price: 18000,
              testDriving: true,
            },
            tradeOldCar: null,
            subscriptionInsurance: false,
            offerType: OfferType.BUY,
            user: { id: sessionCustomer.id },
            testDriving: null,
          },
        ],
      }),
    );
    fixture.destroy();
    fixture = TestBed.createComponent(CustomerPanel);
    fixture.detectChanges();

    const requestButton = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.includes('Demander un essai')) as
      | HTMLButtonElement
      | undefined;
    expect(requestButton).toBeDefined();
    requestButton?.click();
    fixture.detectChanges();

    const dateInput = fixture.nativeElement.querySelector(
      'input[name="testDate"]',
    ) as HTMLInputElement;
    dateInput.value = '2026-11-20T10:30';
    dateInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('.test-drive-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(testDriveService.createTestDrive).toHaveBeenCalledWith({
      testDate: '2026-11-20T10:30',
      confirmed: false,
      carId: 7,
    });
    expect(fixture.nativeElement.textContent).toContain('a été enregistrée');
  });
});
