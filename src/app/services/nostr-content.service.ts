import {Injectable, OnDestroy} from '@angular/core';
import {Event, Filter, SimplePool} from 'nostr-tools';
import {defer, from, Observable, shareReplay, map} from 'rxjs';

export const DEFAULT_NOSTR_PUB_KEY = 'f838b6a03d8d0127a9a98e87c0142b528916a4336ba537e14131a2f513becc17';

export const DEFAULT_NOSTR_RELAYS: string[] = [
  'wss://nostr-relay.sn-media.com/',
  'wss://nostr-pub.wellorder.net/',
  'wss://relay.primal.net/',
  'wss://relay.damus.io/',
  'wss://nos.lol/',
  'wss://relay.ditto.pub/'
];

export type NostrContentResult = {
  pubKey: string;
  kind: number;
  events: Event[];
  loading: boolean;
  done: boolean;
};

export type NostrProfile = {
  name: string;
  picture?: string;
};

@Injectable({
  providedIn: 'root'
})
export class NostrContentService implements OnDestroy {
  private readonly pool = new SimplePool();
  private readonly profileRequests = new Map<string, Observable<NostrProfile | null>>();

  loadContent(
      pubKey: string,
      kind: number,
      limit: number,
      relays: string[] = DEFAULT_NOSTR_RELAYS
  ): Observable<NostrContentResult> {
    return new Observable<NostrContentResult>(subscriber => {
      const eventsById = new Map<string, Event>();
      const filter: Filter = {
        authors: [pubKey],
        kinds: [kind],
        limit
      };

      const emit = (loading: boolean, done: boolean): void => {
        subscriber.next({
          pubKey,
          kind,
          events: Array.from(eventsById.values()),
          loading,
          done
        });
      };

      emit(true, false);

      const subscription = this.pool.subscribe(relays, filter, {
        onevent: (event: Event): void => {
          eventsById.set(event.id, event);
          emit(true, false);
        },
        oneose: (): void => {
          emit(false, true);
          subscriber.complete();
        },
        onclose: (reasons: string[]): void => {
          if (!subscriber.closed && reasons.length > 0) {
            console.warn('Nostr subscription closed:', reasons);
          }
        }
      });

      return () => subscription.close();
    });
  }

  loadProfile(pubKey: string, relays: string[] = DEFAULT_NOSTR_RELAYS): Observable<NostrProfile | null> {
    const cacheKey = `${pubKey}:${relays.join('|')}`;
    const cachedRequest = this.profileRequests.get(cacheKey);

    if (cachedRequest) {
      return cachedRequest;
    }

    const filter: Filter = {
      authors: [pubKey],
      kinds: [0],
      limit: 1
    };

    const request = defer(() => from(this.pool.get(relays, filter))).pipe(
        map((meta: Event | null) => meta ? this.parseProfile(meta.content) : null),
        shareReplay({bufferSize: 1, refCount: false})
    );

    this.profileRequests.set(cacheKey, request);

    return request;
  }

  loadEventById(
      eventId: string,
      kind: number,
      relays: string[] = DEFAULT_NOSTR_RELAYS
  ): Observable<Event | null> {
    const filter: Filter = {
      ids: [eventId],
      kinds: [kind],
      limit: 1
    };

    return defer(() => from(this.pool.get(relays, filter)));
  }

  loadEventByIdentifier(
      pubKey: string,
      identifier: string,
      kind: number = 30023,
      relays: string[] = DEFAULT_NOSTR_RELAYS
  ): Observable<Event | null> {
    const filter: Filter = {
      authors: [pubKey],
      kinds: [kind],
      '#d': [identifier],
      limit: 1
    };

    return defer(() => from(this.pool.get(relays, filter)));
  }

  ngOnDestroy(): void {
    this.pool.destroy();
  }

  private parseProfile(content: string): NostrProfile {
    try {
      const parsed = JSON.parse(content) as { display_name?: string; displayName?: string; name?: string; picture?: string };
      return {
        name: parsed.display_name || parsed.displayName || parsed.name || 'Unknown',
        picture: parsed.picture
      };
    } catch (error) {
      console.warn('Invalid profile metadata:', error);
      return {name: 'Unknown'};
    }
  }
}
