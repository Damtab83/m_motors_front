import { TestBed } from '@angular/core/testing';

import { OldCarService } from './old-car-service';

describe('OldCarService', () => {
  let service: OldCarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OldCarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
