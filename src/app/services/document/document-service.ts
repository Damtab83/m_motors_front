import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/document/upload`;

  uploadDocument(file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<unknown>(this.apiUrl, formData);
  }
}
