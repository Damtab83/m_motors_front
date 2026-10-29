import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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

  protected car: CarModel | null = null;
  protected loading = true;
  protected errorMessage = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? Number.NaN : Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      return;
    }

    this.carService.getCarById(id).subscribe({
      next: (car) => {
        this.car = car;
        this.loading = false;
      },
      error: () => {
        this.car = null;
        this.errorMessage = 'Impossible de charger cette voiture.';
        this.loading = false;
      },
    });
  }
}
