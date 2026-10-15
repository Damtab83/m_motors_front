import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CARS } from './car-data';

@Component({
  selector: 'app-car',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './car.html',
  styleUrl: './car.css',
})
export class Car {
  private readonly route = inject(ActivatedRoute);
  protected readonly car = CARS.find(
    (car) => car.id === this.route.snapshot.paramMap.get('id'),
  );
}
