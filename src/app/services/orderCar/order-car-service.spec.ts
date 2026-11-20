import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OrderCarRequest, OrderCarService } from './order-car-service';
import { environment } from '../../../environments/environment';
import { OfferType } from '../../models/orderCar-model';

describe('OrderCarService', () => {
  let service: OrderCarService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderCarService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve an order by id', () => {
    const order: OrderCarRequest = {
      carId: 7,
      userId: 4,
      offerType: OfferType.BUY,
      oldCarId: null,
      subscriptionInsurance: false,
    };

    service.getOrderById(3).subscribe((result) => {
      expect(result.id).toBe(3);
      expect(result.car?.carId).toBe(7);
      expect(result.user?.id).toBe(4);
      expect(result.tradeOldCar).toBeNull();
      expect(result.subscriptionInsurance).toBe(false);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/commande/3`);
    expect(request.request.method).toBe('GET');
    request.flush({ id: 3, ...order });
  });

  it('should post the flat request contract expected by the backend', () => {
    const order: OrderCarRequest = {
      carId: 7,
      userId: 4,
      offerType: OfferType.BUY,
      oldCarId: null,
      subscriptionInsurance: true,
    };

    service.createOrder(order).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/commande`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(order);
    request.flush(order);
  });
});
