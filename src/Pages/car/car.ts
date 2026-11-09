import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TimeoutError, timeout } from 'rxjs';
import { CarService } from '../../app/services/car/car-service';
import { CarModel } from '../../app/models/car-model';

@Component({
  selector: 'app-car',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './car.html',
  styleUrl: './car.css',
})
export class Car implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly carService = inject(CarService);

  protected readonly car = signal<CarModel | null>(null);
  protected readonly carId = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? Number.NaN : Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      return;
    }

    this.carId.set(id);
    this.carService
      .getCarById(id)
      .pipe(timeout({ first: 15_000 }))
      .subscribe({
        next: (car) => {
          this.car.set(car);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.car.set(null);
          this.errorMessage.set(
            error instanceof TimeoutError
              ? 'Le chargement prend trop de temps. Vérifiez votre connexion puis réessayez.'
              : 'Impossible de charger cette voiture.',
          );
          this.loading.set(false);
        },
      });
  }
}
