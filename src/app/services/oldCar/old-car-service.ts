import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OldCarModel } from '../../models/old-car-model';

@Injectable({
  providedIn: 'root',
})
export class OldCarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ancienne-voiture`;

  getAllOldCars(): Observable<OldCarModel[]> {
    return this.http.get<OldCarModel[]>(this.apiUrl);
  }

  getOldCarById(id: number): Observable<OldCarModel> {
    return this.http.get<OldCarModel>(`${this.apiUrl}/${id}`);
  }

  createOldCar(oldCar: OldCarModel): Observable<OldCarModel> {
    return this.http.post<OldCarModel>(this.apiUrl, oldCar);
  }

  updateOldCar(id: number, oldCar: OldCarModel): Observable<OldCarModel> {
    return this.http.put<OldCarModel>(`${this.apiUrl}/${id}`, oldCar);
  }

  deleteOldCar(id: number): Observable<OldCarModel> {
    return this.http.delete<OldCarModel>(`${this.apiUrl}/${id}`);
  }
}
