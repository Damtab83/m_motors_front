import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarModel } from '../../models/car-model';
import { ImageCarService } from '../imageCar/image-car-service';

interface ApiCar {
  carId?: number;
  id?: number;
  brand: string;
  model: string;
  motorisation: string;
  kilometer: number;
  price: number;
  testDriving?: boolean | { confirmed?: boolean | null } | null;
  imageCar?: string | null;
  imageCarId?: number | null;
  images?: Array<number | ApiImage> | null;
  imageCars?: Array<number | ApiImage> | null;
}

interface ApiCarCollection {
  value: ApiCar[];
  Count: number;
}

interface ApiImage {
  imageCarId?: number;
  contentType?: string;
  imageData?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {

  private http = inject(HttpClient);
  private readonly imageCarService = inject(ImageCarService);

  private apiUrl = `${environment.apiUrl}/voiture`;

  private readonly carRequestTimeout = 15_000;
  private readonly imageRequestTimeout = 8_000;

  getAllCars(): Observable<CarModel[]> {
    return this.http.get<ApiCar[] | ApiCarCollection>(this.apiUrl).pipe(
      timeout({ first: this.carRequestTimeout }),
      map((response) => {
        const cars = Array.isArray(response) ? response : response.value;
        return cars;
      }),
      switchMap((cars) =>
        cars.length === 0
          ? of([])
          : forkJoin(cars.map((car) => this.toCarModelWithImage(car))),
      ),
    );
  }

  getCarById(id: number): Observable<CarModel> {
    return this.http.get<ApiCar>(`${this.apiUrl}/${id}`).pipe(
      timeout({ first: this.carRequestTimeout }),
      switchMap((car) => this.toCarModelWithImage(car)),
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
    const testDriving = car.testDriving;
    return {
      carId: car.carId ?? car.id,
      brand: car.brand,
      model: car.model,
      motorisation: car.motorisation,
      kilometer: car.kilometer,
      price: car.price,
      testDriving:
        typeof testDriving === 'object' && testDriving !== null
          ? testDriving.confirmed ?? null
          : testDriving ?? null,
      imageCar: car.imageCar ?? undefined,
      ...((car.imageCarId ?? this.getImageId(car)) !== undefined
        ? { imageCarId: car.imageCarId ?? this.getImageId(car) }
        : {}),
    };
  }

  private toCarModelWithImage(car: ApiCar): Observable<CarModel> {
    const model = this.toCarModel(car);
    const imageId = model.imageCarId;
    if (imageId === undefined || model.imageCar) {
      return of(model);
    }

    const embeddedImage = this.getImages(car).find(
      (image): image is ApiImage => typeof image !== 'number' && Boolean(image.imageData),
    );
    if (embeddedImage?.imageData && embeddedImage.contentType) {
      return of({
        ...model,
        imageCar: `data:${embeddedImage.contentType};base64,${embeddedImage.imageData}`,
      });
    }

    return this.imageCarService.getImageById(imageId).pipe(
      timeout({ first: this.imageRequestTimeout }),
      map((image) => ({
        ...model,
        imageCar:
          image.imageData && image.contentType
            ? `data:${image.contentType};base64,${image.imageData}`
            : undefined,
        imageCarId: image.imageCarId ?? imageId,
      })),
      catchError(() => of({ ...model, imageLoadError: true })),
    );
  }

  private getImages(car: ApiCar): Array<number | ApiImage> {
    return car.images ?? car.imageCars ?? [];
  }

  private getImageId(car: ApiCar): number | undefined {
    const firstImage = this.getImages(car)[0];
    return typeof firstImage === 'number' ? firstImage : firstImage?.imageCarId;
  }
}
