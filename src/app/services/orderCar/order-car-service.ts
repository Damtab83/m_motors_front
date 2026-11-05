import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderCarModel } from '../../models/orderCar-model';

@Injectable({
  providedIn: 'root',
})
export class OrderCarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/commande`;

  getAllOrders(): Observable<OrderCarModel[]> {
    return this.http.get<OrderCarModel[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<OrderCarModel> {
    return this.http.get<OrderCarModel>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: OrderCarModel): Observable<OrderCarModel> {
    return this.http.post<OrderCarModel>(this.apiUrl, order);
  }

  updateOrder(id: number, order: OrderCarModel): Observable<OrderCarModel> {
    return this.http.put<OrderCarModel>(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: number): Observable<OrderCarModel> {
    return this.http.delete<OrderCarModel>(`${this.apiUrl}/${id}`);
  }
}
