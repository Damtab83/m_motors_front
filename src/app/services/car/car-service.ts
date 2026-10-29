import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarModel } from '../../models/car-model';

interface ApiCar {
  carId?: number;
  id?: number;
  brand: string;
  model: string;
  motorisation: string;
  kilometer: number;
  price: number;
  testDriving?: boolean | null;
  imageCar?: string | null;
}

interface ApiCarCollection {
  value: ApiCar[];
  Count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/voiture`;


  getAllCars(): Observable<CarModel[]> {
    return this.http.get<ApiCar[] | ApiCarCollection>(this.apiUrl).pipe(
      map((response) => {
        const cars = Array.isArray(response) ? response : response.value;
        return cars.map((car) => this.toCarModel(car));
      }),
    );
  }

  getCarById(id: number): Observable<CarModel> {
    return this.http.get<ApiCar>(`${this.apiUrl}/${id}`).pipe(
      map((car) => this.toCarModel(car)),
    );
  }

  createCar(car: CarModel): Observable<CarModel> {
    return this.http.post<ApiCar>(this.apiUrl, car).pipe(
      map((createdCar) => this.toCarModel(createdCar)),
    );
  }

  updateCar(id: number, car: CarModel): Observable<CarModel> {
    return this.http.put<ApiCar>(`${this.apiUrl}/${id}`, car).pipe(
      map((updatedCar) => this.toCarModel(updatedCar)),
    );
  }

  deleteCar(id: number): Observable<CarModel> {
    return this.http.delete<CarModel>(`${this.apiUrl}/${id}`);
  }

  private toCarModel(car: ApiCar): CarModel {
    return {
      id: car.carId ?? car.id,
      brand: car.brand,
      model: car.model,
      motorisation: car.motorisation,
      kilometer: car.kilometer,
      price: car.price,
      testDriving: car.testDriving ?? null,
      imageCar: car.imageCar ?? undefined,
    };
  }
}
