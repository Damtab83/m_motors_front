import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Car } from './car';
import { CarService } from '../../app/services/car/car-service';
import { CarModel } from '../../app/models/car-model';

describe('Car', () => {
  let component: Car;
  let fixture: ComponentFixture<Car>;
  let carService: { getCarById: ReturnType<typeof vi.fn> };
  const car: CarModel = {
    brand: 'Mercedes',
    model: 'Classe A',
    motorisation: '150CV',
    kilometer: 12500,
    price: 25000,
    testDriving: null,
  };

  beforeEach(async () => {
    carService = { getCarById: vi.fn().mockReturnValue(of(car)) };

    await TestBed.configureTestingModule({
      imports: [Car],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
        { provide: CarService, useValue: carService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Car);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display the car returned by the service', () => {
    fixture.detectChanges();

    expect(carService.getCarById).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.textContent).toContain('Mercedes');
    expect(fixture.nativeElement.textContent).toContain('Classe A');
    expect(fixture.nativeElement.textContent).not.toContain('Chargement');
    expect(
      fixture.nativeElement.querySelector('.button-action a:last-child').getAttribute('href'),
    ).toBe('/car/1/selection');
  });

  it('should stop loading and show an error when the request fails', () => {
    carService.getCarById.mockReturnValue(
      throwError(() => new Error('Request failed')),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Impossible de charger cette voiture.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Chargement');
  });
});
