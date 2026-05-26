import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcelandhorseComponent } from './icelandhorse.component';

describe('IcelandhorseComponent', () => {
  let component: IcelandhorseComponent;
  let fixture: ComponentFixture<IcelandhorseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IcelandhorseComponent]
    });
    fixture = TestBed.createComponent(IcelandhorseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
