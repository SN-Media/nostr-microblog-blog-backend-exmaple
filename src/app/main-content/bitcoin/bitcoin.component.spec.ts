import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitcoinComponent } from './bitcoin.component';

describe('BitcoinComponent', () => {
  let component: BitcoinComponent;
  let fixture: ComponentFixture<BitcoinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BitcoinComponent]
    });
    fixture = TestBed.createComponent(BitcoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
