import { TestBed } from '@angular/core/testing';

import { ImageCarService } from './image-car-service';

describe('ImageCarService', () => {
  let service: ImageCarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
