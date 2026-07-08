import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Event} from 'nostr-tools';
import {DEFAULT_NOSTR_RELAYS, NostrContentService} from '../../services/nostr-content.service';
import {Subscription} from 'rxjs';
import {marked, Renderer} from 'marked';

type BlogDetail = {
  event: Event;
  title: string;
  image?: string;
  date: number;
};

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  standalone: false
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private readonly relays: string[] = DEFAULT_NOSTR_RELAYS;
  private readonly markdownRenderer = this.createMarkdownRenderer();
  private readonly subscriptions = new Subscription();

  blogDetail: BlogDetail | null = null;
  loading = true;
  notFound = false;
  backRoute = '/';
  backgroundImage = '';
  formattedContent = '';

  constructor(
      private readonly route: ActivatedRoute,
      private readonly nostrContentService: NostrContentService
  ) {}

  ngOnInit(): void {
    const identifier = this.route.snapshot.paramMap.get('identifier') ?? '';
    const pubKey = this.route.snapshot.data['pubKey'] as string;
    this.backRoute = this.route.snapshot.data['backRoute'] as string ?? '/';
    this.backgroundImage = this.route.snapshot.data['backgroundImage'] as string ?? '';

    this.subscriptions.add(
        this.nostrContentService.loadEventByIdentifier(pubKey, identifier, 30023, this.relays)
            .subscribe({
              next: (event: Event | null): void => {
                if (event) {
                  this.blogDetail = this.createBlogDetail(event);
                  this.formattedContent = this.formatContent(event.content);
                } else {
                  this.notFound = true;
                }
                this.loading = false;
              },
              error: (error: unknown): void => {
                console.error('Error loading blog detail:', error);
                this.loading = false;
                this.notFound = true;
              }
            })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createBlogDetail(event: Event): BlogDetail {
    const title = this.getTagValue(event, 'title') || 'Untitled';
    const publishedAt = Number(this.getTagValue(event, 'published_at'));

    return {
      event,
      title,
      image: this.getTagValue(event, 'image'),
      date: Number.isFinite(publishedAt) && publishedAt > 0 ? publishedAt : event.created_at
    };
  }

  private formatContent(content: string): string {
    return marked.parse(content, {
      breaks: true,
      gfm: true,
      renderer: this.markdownRenderer
    }) as string;
  }

  private getTagValue(event: Event, tagName: string): string | undefined {
    const tag = event.tags.find(currentTag => currentTag[0] === tagName && currentTag[1]);
    return tag ? tag[1] : undefined;
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
