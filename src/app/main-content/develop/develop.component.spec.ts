import { ComponentFixture, TestBed } from '@angular/core/testing';
import {of} from 'rxjs';

import { DevelopComponent } from './develop.component';
import {NostrContentService} from '../../services/nostr-content.service';

describe('DevelopComponent', () => {
  let component: DevelopComponent;
  let fixture: ComponentFixture<DevelopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevelopComponent],
      providers: [
        {
          provide: NostrContentService,
          useValue: {
            loadContent: () => of({
              pubKey: '',
              kind: 30023,
              events: [],
              loading: false,
              done: true
            })
          }
        }
      ]
    });
    fixture = TestBed.createComponent(DevelopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats blog content as Markdown', () => {
    const html = component.formatContent('This is **bold**, *italic*, and https://example.com/image.webp');

    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<span class="blog-entry-media">');
    expect(html).toContain('<img src="https://example.com/image.webp" alt="Blog image"/>');
  });
});
