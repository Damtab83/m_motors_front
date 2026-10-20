import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { CARS } from './car-data';

@Component({
  selector: 'app-car',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './car.html',
  styleUrl: './car.css',
})
export class Car {
  private readonly route = inject(ActivatedRoute);
  protected readonly car = CARS.find(
    (car) => car.id === this.route.snapshot.paramMap.get('id'),
  );
}
