import {Component, OnDestroy, OnInit} from '@angular/core';
import {Event, nip19} from 'nostr-tools';
import {DomSanitizer} from '@angular/platform-browser';
import {finalize, Subscription} from 'rxjs';
import {
  DEFAULT_NOSTR_PUB_KEY,
  DEFAULT_NOSTR_RELAYS,
  NostrContentService,
  NostrProfile
} from '../services/nostr-content.service';

type NostrThreadItem = {
  event: Event;
  type: 'post' | 'reply';
  parentId?: string;
  parent?: Event;
  authorProfile?: NostrProfile;
  parentAuthorProfile?: NostrProfile;
};

@Component({
  selector: 'app-nostr-content',
  templateUrl: './nostr-content.component.html',
  styleUrls: ['./nostr-content.component.scss'],
  standalone: false
})
export class NostrContentComponent implements OnInit, OnDestroy {

  authorName: string = '';
  pubKey: string = DEFAULT_NOSTR_PUB_KEY;
  relay: string[] = DEFAULT_NOSTR_RELAYS;
  events: NostrThreadItem[] = [];
  private parentCache: Map<string, Event> = new Map<string, Event>();
  private profileCache: Map<string, NostrProfile> = new Map<string, NostrProfile>();
  private readonly subscriptions = new Subscription();
  private readonly loadedEventIds = new Set<string>();

  eventsFired: number = 0;
  eventsDone: number = 0;

  constructor(
      protected sanitizer: DomSanitizer,
      private readonly nostrContentService: NostrContentService
  ) {
    this.loadProfile();
    this.loadAllNotes();
  }

  ngOnInit(): void {
    //https://nostr-components.web.app
    const scriptFollow = document.createElement('script');
    scriptFollow.type = 'module';
    scriptFollow.src = '/assets/nostr-components/nostr-follow-button.js';
    document.body.appendChild(scriptFollow);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadProfile() {
    this.eventsFired++;
    this.subscriptions.add(
        this.nostrContentService.loadProfile(this.pubKey, this.relay)
            .pipe(finalize(() => this.eventsDone++))
            .subscribe({
              next: (profile: NostrProfile | null): void => {
                if (profile) {
                  this.authorName = profile.name;
                  this.profileCache.set(this.pubKey, profile);
                } else {
                  console.warn('No meta information found.');
                }
              },
              error: (error: unknown): void => {
                console.error('Error loading profile meta:', error);
              }
            })
    );
  }

  private loadAllNotes() {
    this.eventsFired++;
    this.subscriptions.add(
        this.nostrContentService.loadContent(this.pubKey, 1, 15, this.relay)
            .pipe(finalize(() => this.eventsDone++))
            .subscribe({
              next: result => {
                result.events.forEach((event: Event): void => {
                  if (!this.loadedEventIds.has(event.id)) {
                    this.loadedEventIds.add(event.id);
                    this.addNote(event);
                  }
                });

                if (result.done) {
                  this.events.sort((a, b) => b.event.created_at - a.event.created_at);
                }
              },
              error: (error: unknown): void => {
                console.error('Error loading Nostr notes:', error);
              }
            })
    );
  }

  private addNote(event: Event): void {
    if (event.content.includes("nostr:nprofile")) {
      return;
    }

    const replyToId = this.getReplyTargetId(event);
    const preparedEvent = this.loadEmbeddedNostrNotes(event);

    const item: NostrThreadItem = {
      event: preparedEvent,
      type: replyToId ? 'reply' : 'post',
      parentId: replyToId || undefined
    };

    this.events.push(item);
    this.loadAuthorProfile(preparedEvent.pubkey, profile => {
      item.authorProfile = profile;
    });

    if (replyToId) {
      this.loadParentNoteById(replyToId, item);
    }
  }

  private loadParentNoteById(noteId: string, item: NostrThreadItem) {
    const cached = this.parentCache.get(noteId);
    if (cached) {
      item.parent = cached;
      const cachedProfile = this.profileCache.get(cached.pubkey);
      if (cachedProfile) {
        item.parentAuthorProfile = cachedProfile;
      } else {
        this.loadAuthorProfile(cached.pubkey, profile => {
          item.parentAuthorProfile = profile;
        });
      }
      return;
    }

    this.eventsFired++;
    this.subscriptions.add(
        this.nostrContentService.loadEventById(noteId, 1, this.relay)
            .pipe(finalize(() => this.eventsDone++))
            .subscribe({
              next: (note: Event | null): void => {
                if (note) {
                  const prepared = this.loadEmbeddedNostrNotes(note);
                  this.parentCache.set(noteId, prepared);
                  item.parent = prepared;
                  this.loadAuthorProfile(prepared.pubkey, profile => {
                    item.parentAuthorProfile = profile;
                  });
                }
              },
              error: (error: unknown): void => {
                console.error('Error loading Nostr note:', error);
              }
            })
    );
  }

  private getReplyTargetId(event: Event): string | null {
    let rootId: string | null = null;
    for (const tag of event.tags) {
      if (tag[0] !== 'e') {
        continue;
      }
      if (tag[3] === 'reply') {
        return tag[1];
      }
      if (!rootId && tag[3] === 'root') {
        rootId = tag[1];
      }
    }
    return rootId;
  }

  private loadEmbeddedNostrNotes(event: Event): Event {
    const nostrEventRegex = /(nostr:nevent\S*)/gi;
    let matches = event.content.match(nostrEventRegex);
    if (matches) {
      matches.forEach(match => {
        const noteId = match.split(':')[1];
        const decodedNoteId = nip19.decode(noteId);
        if (decodedNoteId.type === 'nevent') {
          this.loadEmbeddedNoteById(decodedNoteId.data.id, event);
        }
      });
    }

    event.content = event.content.replace(nostrEventRegex, '');

    return event;
  }

  private loadAuthorProfile(pubkey: string, onLoaded: (profile: NostrProfile) => void) {
    const cached = this.profileCache.get(pubkey);
    if (cached) {
      onLoaded(cached);
      return;
    }

    this.eventsFired++;
    this.subscriptions.add(
        this.nostrContentService.loadProfile(pubkey, this.relay)
            .pipe(finalize(() => this.eventsDone++))
            .subscribe({
              next: (profile: NostrProfile | null): void => {
                if (profile) {
                  this.profileCache.set(pubkey, profile);
                  onLoaded(profile);
                }
              },
              error: (error: unknown): void => {
                console.error('Error loading author profile:', error);
              }
            })
    );
  }

  private loadEmbeddedNoteById(noteId: string, parentEvent: Event) {
    this.eventsFired++;
    this.subscriptions.add(
        this.nostrContentService.loadEventById(noteId, 1, this.relay)
            .pipe(finalize(() => this.eventsDone++))
            .subscribe({
              next: (note: Event | null): void => {
                if (note) {
                  const prepared = this.loadEmbeddedNostrNotes(note);
                  parentEvent.content += "<br/><br/><quote style='display: block;margin-left: 20px;border-left: 1px solid;padding-left: 15px;'> " + this.transformContent(prepared.content) + " </quote>";
                }
              },
              error: (error: unknown): void => {
                console.error('Error loading embedded Nostr note:', error);
              }
            })
    );
  }

  public transformContent(content: string): string {
    const imageUrlRegex = /(?<!(?:href|src)=")(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp)(?![^\s]*\.[^\s]))(?!(?:[^>]*>))/gi;
    const videoUrlRegex = /(?<!(?:href|src)=")(https?:\/\/[^\s]+?\.(?:mp4|avi|mpeg)(?![^\s]*\.[^\s]))(?!(?:[^>]*>))/gi;
    const nonImageUrlRegex = /(?<!(?:href|src)=")(https?:\/\/[^\s<>"']+)(?<!\.(?:jpg|jpeg|png|gif|webp))/gi;

    content = content.replace(imageUrlRegex, '<div style="display: flex; justify-content: center;"><center><a href="$1" target="_blank"><img src="$1" alt="Image" style="max-width: 50%; max-height:400px; height: auto; margin: 10px 0;"/></a></center></div>');
    content = content.replace(videoUrlRegex, '<center><vg-player><video [vgMedia]="$any(media)" #media id="singleVideo" preload="none" controls><source src="$1" type="video/mp4"></video></vg-player></center>');
    content = content.replace(nonImageUrlRegex, '<a href="$1" target="_blank" style="color: #ffffff;font-weight: bold;text-decoration: none;">$1</a>');
    content = content.replace(/\n/g, '<br/>');

    return content;
  }
}
