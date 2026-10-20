import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPanel } from './customer-panel';

describe('CustomerPanel', () => {
  let component: CustomerPanel;
  let fixture: ComponentFixture<CustomerPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
