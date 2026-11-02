import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarModel } from '../../app/models/car-model';
import { UserModel } from '../../app/models/user-model';

interface CarForm {
  brand: string;
  model: string;
  motorisation: string;
  kilometer: number;
  price: number;
  testDriving: boolean;
}

@Component({
  selector: 'app-custom-details',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './custom-details.html',
  styleUrl: './custom-details.css',
})
export class CustomDetails implements OnChanges {
  @Input() user: UserModel | null = null;
  @Input() car: CarModel | null = null;
  @Input() carEditMode = false;
  @Input() saving = false;
  @Input() editorError = '';

  @Output() close = new EventEmitter<void>();
  @Output() saveCar = new EventEmitter<CarModel>();
  @Output() deleteCar = new EventEmitter<void>();

  protected carForm: CarForm = this.emptyCarForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['car'] || changes['carEditMode']) {
      this.carForm = this.car
        ? {
            brand: this.car.brand,
            model: this.car.model,
            motorisation: this.car.motorisation,
            kilometer: this.car.kilometer,
            price: this.car.price,
            testDriving: this.car.testDriving ?? false,
          }
        : this.emptyCarForm();
    }
  }

  protected updateCarField(field: keyof CarForm, event: Event): void {
    const input = event.target as HTMLInputElement;

    switch (field) {
      case 'brand':
      case 'model':
      case 'motorisation':
        this.carForm = { ...this.carForm, [field]: input.value };
        break;
      case 'kilometer':
      case 'price':
        this.carForm = { ...this.carForm, [field]: Number(input.value) };
        break;
      case 'testDriving':
        this.carForm = { ...this.carForm, testDriving: input.checked };
        break;
    }
  }

  protected submitCar(event: Event): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;

    if (!form.reportValidity() || this.saving) {
      return;
    }

    this.saveCar.emit({
      ...this.carForm,
      carId: this.car?.carId,
    });
  }

  private emptyCarForm(): CarForm {
    return {
      brand: '',
      model: '',
      motorisation: '',
      kilometer: 0,
      price: 0,
      testDriving: false,
    };
  }
}
