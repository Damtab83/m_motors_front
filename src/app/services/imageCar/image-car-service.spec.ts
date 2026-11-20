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

  it('should upload image bytes as multipart to the car upload endpoint', () => {
    const image = new File(['image'], 'car.jpg', { type: 'image/jpeg' });
    const response = { imageCarId: 5, name: 'car.jpg', size: image.size };

    service.uploadImage(image, 12).subscribe((createdImage) => {
      expect(createdImage).toEqual(response);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/image-voiture/upload/12`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('file')).toBe(image);
    request.flush(response);
  });

  it('should delete an image by ID', () => {
    service.deleteImage(5).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/image-voiture/5`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
