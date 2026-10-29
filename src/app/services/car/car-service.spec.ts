import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CarService } from './car-service';
import { environment } from '../../../environments/environment';

describe('CarService', () => {
  let service: CarService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CarService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should unwrap and normalize the API car collection', () => {
    service.getAllCars().subscribe((cars) => {
      expect(cars).toEqual([
        {
          id: 1,
          brand: 'Mercedes',
          model: 'Classe A',
          motorisation: '150CV',
          kilometer: 12500,
          price: 25000,
          testDriving: null,
          imageCar: undefined,
        },
      ]);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/voiture`);
    expect(request.request.method).toBe('GET');
    request.flush({
      value: [
        {
          carId: 1,
          brand: 'Mercedes',
          model: 'Classe A',
          motorisation: '150CV',
          kilometer: 12500,
          price: 25000,
          imageCars: [],
          testDriving: null,
        },
      ],
      Count: 1,
    });
  });
});
