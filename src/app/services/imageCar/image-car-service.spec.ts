import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ImageCarService } from './image-car-service';
import { environment } from '../../../environments/environment';

describe('ImageCarService', () => {
  let service: ImageCarService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ImageCarService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an image for a car', () => {
    const image = { imageCarId: 1, name: 'car.jpg', size: 1024 };

    service.createImage(image).subscribe((createdImage) => {
      expect(createdImage).toEqual(image);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/image-voiture`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(image);
    request.flush(image);
  });
});
