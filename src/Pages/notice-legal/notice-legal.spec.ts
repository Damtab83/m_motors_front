import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeLegal } from './notice-legal';

describe('NoticeLegal', () => {
  let component: NoticeLegal;
  let fixture: ComponentFixture<NoticeLegal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticeLegal],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeLegal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
