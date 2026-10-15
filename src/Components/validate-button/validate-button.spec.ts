import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateButton } from './validate-button';

describe('ValidateButton', () => {
  let component: ValidateButton;
  let fixture: ComponentFixture<ValidateButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidateButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
