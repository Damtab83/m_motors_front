import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TestDriveRequest {
  testDate: string;
  confirmed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TestDriveService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/essai-voiture`;

  createTestDrive(testDrive: TestDriveRequest): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, testDrive);
  }
}
