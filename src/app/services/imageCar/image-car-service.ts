import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImageCarModel } from '../../models/image-car-model';

@Injectable({
  providedIn: 'root',
})
export class ImageCarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/image-voiture`;

  getAllImages(): Observable<ImageCarModel[]> {
    return this.http.get<ImageCarModel[]>(this.apiUrl);
  }

  getImageById(id: number): Observable<ImageCarModel> {
    return this.http.get<ImageCarModel>(`${this.apiUrl}/${id}`);
  }

  createImage(image: ImageCarModel): Observable<ImageCarModel> {
    return this.http.post<ImageCarModel>(this.apiUrl, image);
  }

  updateImage(id: number, image: ImageCarModel): Observable<ImageCarModel> {
    return this.http.put<ImageCarModel>(`${this.apiUrl}/${id}`, image);
  }

  deleteImage(id: number): Observable<ImageCarModel> {
    return this.http.delete<ImageCarModel>(`${this.apiUrl}/${id}`);
  }
}
