import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginField } from './login-field';

describe('LoginField', () => {
  let component: LoginField;
  let fixture: ComponentFixture<LoginField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginField],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
