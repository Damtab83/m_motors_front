import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDetails } from './custom-details';

describe('CustomDetails', () => {
  let component: CustomDetails;
  let fixture: ComponentFixture<CustomDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
