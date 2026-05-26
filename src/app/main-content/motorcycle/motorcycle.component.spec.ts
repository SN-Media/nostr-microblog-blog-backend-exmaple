import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorcycleComponent } from './motorcycle.component';

describe('MotorcycleComponent', () => {
  let component: MotorcycleComponent;
  let fixture: ComponentFixture<MotorcycleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MotorcycleComponent]
    });
    fixture = TestBed.createComponent(MotorcycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
