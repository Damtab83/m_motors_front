import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CarList } from './car-list';
import { CarService } from '../../app/services/car/car-service';
import { CarModel } from '../../app/models/car-model';

describe('CarList', () => {
  let component: CarList;
  let fixture: ComponentFixture<CarList>;
  const cars: CarModel[] = [
    {
      carId: 1,
      brand: 'Mercedes',
      model: 'Classe A',
      motorisation: '150CV',
      kilometer: 12500,
      price: 25000,
      testDriving: null,
    },
    {
      carId: 2,
      brand: 'BMW',
      model: 'Série 3',
      motorisation: '190CV',
      kilometer: 80000,
      price: 50000,
      testDriving: null,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarList],
      providers: [
        provideRouter([]),
        { provide: CarService, useValue: { getAllCars: () => of(cars) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the cars received from the service', async () => {
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Mercedes');
    expect(fixture.nativeElement.textContent).toContain('Classe A');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/car/1');
    expect(fixture.nativeElement.textContent).toContain('BMW');
  });

  it('should filter cars by the selected maximum price and mileage', () => {
    const priceSlider: HTMLInputElement =
      fixture.nativeElement.querySelector('[aria-label="Prix maximum"]');
    const kilometerSlider: HTMLInputElement =
      fixture.nativeElement.querySelector('[aria-label="Kilométrage maximum"]');

    priceSlider.value = '30000';
    priceSlider.dispatchEvent(new Event('input'));
    kilometerSlider.value = '20000';
    kilometerSlider.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Mercedes');
    expect(fixture.nativeElement.textContent).not.toContain('BMW');
  });
});
