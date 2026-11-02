import { TestBed } from '@angular/core/testing';

import { OrderCarService } from './order-car-service';

describe('OrderCarService', () => {
  let service: OrderCarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderCarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
