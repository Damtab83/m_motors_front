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
          carId: 1,
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

  it('should load an associated image using the image IDs returned by the API', () => {
    service.getAllCars().subscribe((cars) => {
      expect(cars[0]).toEqual({
        carId: 1,
        brand: 'Mercedes',
        model: 'Classe A',
        motorisation: '150CV',
        kilometer: 12500,
        price: 25000,
        testDriving: true,
        imageCarId: 5,
        imageCar: 'data:image/jpeg;base64,aW1hZ2U=',
      });
    });

    const carsRequest = httpTestingController.expectOne(`${environment.apiUrl}/voiture`);
    carsRequest.flush([
      {
        id: 1,
        brand: 'Mercedes',
        model: 'Classe A',
        motorisation: '150CV',
        kilometer: 12500,
        price: 25000,
        images: [5],
        testDriving: { confirmed: true },
      },
    ]);

    const imageRequest = httpTestingController.expectOne(`${environment.apiUrl}/image-voiture/5`);
    expect(imageRequest.request.method).toBe('GET');
    imageRequest.flush({
      imageCarId: 5,
      name: 'car.jpg',
      size: 5,
      contentType: 'image/jpeg',
      imageData: 'aW1hZ2U=',
    });
  });

  it('should load the associated image when getting a car by ID', () => {
    service.getCarById(1).subscribe((car) => {
      expect(car.imageCarId).toBe(5);
      expect(car.imageCar).toBe('data:image/png;base64,cG5n');
    });

    const carRequest = httpTestingController.expectOne(`${environment.apiUrl}/voiture/1`);
    carRequest.flush({
      id: 1,
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: 45000,
      price: 38000,
      images: [5],
    });

    const imageRequest = httpTestingController.expectOne(`${environment.apiUrl}/image-voiture/5`);
    imageRequest.flush({
      imageCarId: 5,
      name: 'mustang.png',
      size: 4,
      contentType: 'image/png',
      imageData: 'cG5n',
    });
  });

  it('should support the backend imageCars field and keep the car list if an image fails', () => {
    service.getAllCars().subscribe((cars) => {
      expect(cars).toHaveLength(1);
      expect(cars[0].carId).toBe(1);
      expect(cars[0].imageCarId).toBe(5);
      expect(cars[0].imageLoadError).toBe(true);
    });

    const carsRequest = httpTestingController.expectOne(`${environment.apiUrl}/voiture`);
    carsRequest.flush([
      {
        carId: 1,
        brand: 'Ford',
        model: 'Mustang',
        motorisation: '200CV',
        kilometer: 45000,
        price: 38000,
        imageCars: [{ imageCarId: 5 }],
      },
    ]);

    const imageRequest = httpTestingController.expectOne(`${environment.apiUrl}/image-voiture/5`);
    imageRequest.flush('Image unavailable', { status: 500, statusText: 'Server Error' });
  });
});
