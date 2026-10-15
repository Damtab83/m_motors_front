import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterField } from './register-field';

describe('RegisterField', () => {
  let component: RegisterField;
  let fixture: ComponentFixture<RegisterField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterField],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
