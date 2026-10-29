import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { CarService } from '../../app/services/car/car-service';
import { CarModel } from '../../app/models/car-model';

@Component({
  selector: 'app-car-list',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css',
})
export class CarList implements OnInit {

  private readonly carService = inject(CarService);

  readonly cars = signal<CarModel[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.carService.getAllCars().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.status === 404
            ? 'Aucune voiture trouvée.'
            : 'Impossible de charger les voitures.',
        );
        this.loading.set(false);
      }
    });
  }
}
