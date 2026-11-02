import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TestDriveService } from './test-drive-service';
import { environment } from '../../../environments/environment';

describe('TestDriveService', () => {
  let service: TestDriveService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TestDriveService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create an unconfirmed test drive with its selected date', () => {
    const testDrive = { testDate: '2026-11-05', confirmed: false };

    service.createTestDrive(testDrive).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/essai-voiture`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(testDrive);
    request.flush({ message: 'created' });
  });
});
