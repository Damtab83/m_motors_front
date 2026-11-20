import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  readonly maxPrice = computed(() =>
    Math.max(0, ...this.cars().map((car) => car.price)),
  );
  readonly maxKilometer = computed(() =>
    Math.max(0, ...this.cars().map((car) => car.kilometer)),
  );
  readonly priceLimit = signal(0);
  readonly kilometerLimit = signal(0);
  readonly filteredCars = computed(() =>
    this.cars().filter(
      (car) => car.price <= this.priceLimit() && car.kilometer <= this.kilometerLimit(),
    ),
  );

  ngOnInit(): void {
    this.carService.getAllCars().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.priceLimit.set(this.maxPrice());
        this.kilometerLimit.set(this.maxKilometer());
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.status === 404
            ? 'Aucune voiture trouvée.'
            : error.status === 0
              ? 'Impossible de joindre le serveur pour charger les voitures.'
              : `Impossible de charger les voitures (HTTP ${error.status}).`,
        );
        this.loading.set(false);
      }
    });
  }

  updatePriceLimit(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.priceLimit.set(Number(input.value));
    }
  }

  updateKilometerLimit(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.kilometerLimit.set(Number(input.value));
    }
  }

  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR');
  }
}
