import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NostrContentComponent } from './nostr-content.component';

describe('NostrContentComponent', () => {
  let component: NostrContentComponent;
  let fixture: ComponentFixture<NostrContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NostrContentComponent]
    });
    fixture = TestBed.createComponent(NostrContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
