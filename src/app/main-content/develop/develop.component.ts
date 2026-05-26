import {Component, OnDestroy} from '@angular/core';
import {Event} from "nostr-tools";
import {Subscription} from "rxjs";
import {marked, Renderer} from "marked";
import {
  DEFAULT_NOSTR_PUB_KEY,
  DEFAULT_NOSTR_RELAYS,
  NostrContentService
} from "../../services/nostr-content.service";

type BlogEntry = {
  event: Event;
  title: string;
  summary: string;
  image?: string;
  date: number;
  identifier: string;
};

@Component({
  selector: 'app-develop',
  templateUrl: './develop.component.html',
  styleUrls: ['./develop.component.scss'],
  standalone: false
})
export class DevelopComponent implements OnDestroy {
  private readonly pubKey = DEFAULT_NOSTR_PUB_KEY;
  private readonly relays: string[] = DEFAULT_NOSTR_RELAYS;
  private readonly blogEntriesByIdentifier = new Map<string, BlogEntry>();
  private readonly formattedContentByContent = new Map<string, string>();
  private readonly markdownRenderer = this.createMarkdownRenderer();
  private readonly subscriptions = new Subscription();

  blogEntries: BlogEntry[] = [];
  blogLoading = true;

  constructor(
      private readonly nostrContentService: NostrContentService
  ) {
    //https://nostr-components.web.app
    const scriptProfil = document.createElement('script');
    scriptProfil.type = 'module';
    scriptProfil.src = '/assets/nostr-components/nostr-profile.js';
    document.body.appendChild(scriptProfil);

    this.loadBlogEntries();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  formatContent(content: string): string {
    const cachedContent = this.formattedContentByContent.get(content);
    if (cachedContent !== undefined) {
      return cachedContent;
    }

    const formattedContent = marked.parse(content, {
      breaks: true,
      gfm: true,
      renderer: this.markdownRenderer
    });
    this.formattedContentByContent.set(content, formattedContent);

    return formattedContent;
  }

  private loadBlogEntries(): void {
    this.subscriptions.add(
        this.nostrContentService.loadContent(this.pubKey, 30023, 50, this.relays)
            .subscribe({
              next: result => {
                result.events.forEach((event: Event): void => {
                  this.upsertBlogEntry(event);
                });

                this.blogLoading = result.loading;

                if (result.done) {
                  this.sortBlogEntries();
                }
              },
              error: (error: unknown): void => {
                console.error('Error loading blog entries:', error);
                this.blogLoading = false;
              }
            })
    );
  }

  private upsertBlogEntry(event: Event): void {
    const entry = this.createBlogEntry(event);
    const existingEntry = this.blogEntriesByIdentifier.get(entry.identifier);

    if (existingEntry && existingEntry.event.created_at >= entry.event.created_at) {
      return;
    }

    this.blogEntriesByIdentifier.set(entry.identifier, entry);
    this.blogEntries = Array.from(this.blogEntriesByIdentifier.values());
    this.sortBlogEntries();
  }

  private createBlogEntry(event: Event): BlogEntry {
    const title = this.getTagValue(event, 'title') || 'Untitled';
    const summary = this.getTagValue(event, 'summary') || this.createSummary(event.content);
    const publishedAt = Number(this.getTagValue(event, 'published_at'));
    const identifier = this.getTagValue(event, 'd') || event.id;

    return {
      event,
      title,
      summary,
      image: this.getTagValue(event, 'image'),
      date: Number.isFinite(publishedAt) && publishedAt > 0 ? publishedAt : event.created_at,
      identifier
    };
  }

  private sortBlogEntries(): void {
    this.blogEntries = [...this.blogEntries].sort((a, b) => b.date - a.date);
  }

  private getTagValue(event: Event, tagName: string): string | undefined {
    const tag = event.tags.find(currentTag => currentTag[0] === tagName && currentTag[1]);
    return tag ? tag[1] : undefined;
  }

  private createSummary(content: string): string {
    const plainContent = content
        .replace(/[#>*_`~\-[\]()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return plainContent.length > 180 ? `${plainContent.slice(0, 177)}...` : plainContent;
  }

  private createMarkdownRenderer(): Renderer {
    const renderer = new Renderer();

    renderer.link = (href: string, title: string | null | undefined, text: string): string => {
      const url = this.escapeAttribute(href);
      const titleAttribute = title ? ` title="${this.escapeAttribute(title)}"` : '';

      if (this.isImageUrl(href) && this.stripHtml(text) === href) {
        return this.renderImageLink(url, 'Blog image');
      }

      return `<a href="${url}"${titleAttribute} target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    renderer.image = (href: string, title: string | null, text: string): string => {
      const url = this.escapeAttribute(href);
      const alt = this.escapeAttribute(text || title || 'Blog image');
      const titleAttribute = title ? ` title="${this.escapeAttribute(title)}"` : '';

      return this.renderImageLink(url, alt, titleAttribute);
    };

    return renderer;
  }

  private renderImageLink(url: string, alt: string, titleAttribute: string = ''): string {
    return `<span class="blog-entry-media"><a href="${url}" target="_blank" rel="noopener noreferrer"><img src="${url}" alt="${alt}"${titleAttribute}/></a></span>`;
  }

  private isImageUrl(url: string): boolean {
    return /^https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(?:[?#]\S*)?$/i.test(url);
  }

  private stripHtml(content: string): string {
    return content.replace(/<[^>]*>/g, '');
  }

  private escapeAttribute(content: string): string {
    return content
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  }
}
