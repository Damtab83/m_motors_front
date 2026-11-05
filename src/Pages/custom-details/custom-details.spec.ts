import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDetails } from './custom-details';
import { CarModel } from '../../app/models/car-model';

describe('CustomDetails', () => {
  let component: CustomDetails;
  let fixture: ComponentFixture<CustomDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the new car when the form is submitted', () => {
    let submittedCar: CarModel | undefined;
    component.saveCar.subscribe((car) => submittedCar = car);
    fixture.componentRef.setInput('carEditMode', true);
    fixture.detectChanges();

    const values: Record<string, string> = {
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: '45000',
      price: '38000',
    };

    for (const [name, value] of Object.entries(values)) {
      const input = fixture.nativeElement.querySelector(`[name="${name}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(submittedCar).toEqual({
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: 45000,
      price: 38000,
      testDriving: false,
      carId: undefined,
    });
  });

  it('should emit a delete request for an existing car', () => {
    let deleteRequested = false;
    component.deleteCar.subscribe(() => deleteRequested = true);
    fixture.componentRef.setInput('carEditMode', true);
    fixture.componentRef.setInput('car', {
      carId: 1,
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: 45000,
      price: 38000,
      testDriving: false,
    });
    fixture.detectChanges();

    const deleteButton = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .find((button) => button.textContent.includes('Supprimer')) as HTMLButtonElement;
    deleteButton.click();

    expect(deleteRequested).toBe(true);
  });
});
