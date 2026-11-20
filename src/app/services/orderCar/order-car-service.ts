import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderCarModel } from '../../models/orderCar-model';
import { CarModel } from '../../models/car-model';
import { OldCarModel } from '../../models/old-car-model';
import { UserModel } from '../../models/user-model';

export interface OrderCarRequest {
  carId: number;
  userId: number;
  offerType: OrderCarModel['offerType'];
  oldCarId: number | null;
  subscriptionInsurance: boolean;
}

interface ApiOrderCar {
  id?: number;
  carId?: number;
  userId?: number;
  offerType: OrderCarModel['offerType'];
  oldCarId?: number | null;
  subscriptionInsurance: boolean;
  car?: CarModel;
  user?: UserModel;
  tradeOldCar?: OldCarModel | null;
}

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
    return this.http.get<ApiOrderCar>(`${this.apiUrl}/${id}`).pipe(
      map((order) => ({
        id: order.id,
        offerType: order.offerType,
        subscriptionInsurance: order.subscriptionInsurance,
        car:
          order.car ??
          (order.carId !== undefined
            ? { carId: order.carId }
            : undefined),
        user:
          order.user ??
          (order.userId !== undefined
            ? { id: order.userId }
            : undefined),
        tradeOldCar:
          order.tradeOldCar ??
          (order.oldCarId !== undefined && order.oldCarId !== null
            ? { oldCarId: order.oldCarId }
            : null),
      })),
    );
  }

  createOrder(order: OrderCarRequest): Observable<ApiOrderCar> {
    return this.http.post<ApiOrderCar>(this.apiUrl, order);
  }

  updateOrder(id: number, order: OrderCarRequest): Observable<ApiOrderCar> {
    return this.http.put<ApiOrderCar>(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: number): Observable<OrderCarModel> {
    return this.http.delete<OrderCarModel>(`${this.apiUrl}/${id}`);
  }
}
