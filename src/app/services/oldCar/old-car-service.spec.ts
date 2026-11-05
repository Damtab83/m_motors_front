import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OldCarService } from './old-car-service';
import { environment } from '../../../environments/environment';

describe('OldCarService', () => {
  let service: OldCarService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OldCarService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve an old car by id', () => {
    const oldCar = { oldCarId: 3, brand: 'Renault', model: 'Clio', price: 5000 };

    service.getOldCarById(3).subscribe((result) => {
      expect(result).toEqual(oldCar);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/ancienne-voiture/3`);
    expect(request.request.method).toBe('GET');
    request.flush(oldCar);
  });
});
