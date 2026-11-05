import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OrderCarService } from './order-car-service';
import { environment } from '../../../environments/environment';

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
    const order = { id: 3, subscriptionInsurance: false };

    service.getOrderById(3).subscribe((result) => {
      expect(result).toEqual(order);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/commande/3`);
    expect(request.request.method).toBe('GET');
    request.flush(order);
  });
});
