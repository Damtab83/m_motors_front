import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesConditions } from './sales-conditions';

describe('SalesConditions', () => {
  let component: SalesConditions;
  let fixture: ComponentFixture<SalesConditions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesConditions],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesConditions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
