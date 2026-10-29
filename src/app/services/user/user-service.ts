import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from '../../models/user-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/client`;

  getAllUsers(): Observable<UserModel[]> {
      return this.http.get<UserModel[]>(this.apiUrl);
    }
  
    getUserById(id: number): Observable<UserModel> {
      return this.http.get<UserModel>(`${this.apiUrl}/${id}`);
    }
  
    createUser(userCustom: UserModel): Observable<UserModel> {
      return this.http.post<UserModel>(`${this.apiUrl}`, userCustom);
    }
  
    updateUser(id: number, userCustom: UserModel): Observable<UserModel> {
      return this.http.put<UserModel>(`${this.apiUrl}/${id}`, userCustom);
    }
  
    deleteUser(id: number): Observable<UserModel> {
      return this.http.delete<UserModel>(`${this.apiUrl}/${id}`);
    }
}
