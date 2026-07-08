import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent } from './menu/menu.component';
import { WelcomeComponent } from './main-content/welcome/welcome.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NostrContentComponent } from './nostr-content/nostr-content.component';
import { PersonComponent } from './main-content/person/person.component';
import { DevelopComponent } from './main-content/develop/develop.component';
import { MotorcycleComponent } from './main-content/motorcycle/motorcycle.component';
import { IcelandhorseComponent } from './main-content/icelandhorse/icelandhorse.component';
import { BitcoinComponent } from './main-content/bitcoin/bitcoin.component';
import { BlogDetailComponent } from './main-content/blog-detail/blog-detail.component';
import {VgCoreModule} from "@videogular/ngx-videogular/core";

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    WelcomeComponent,
    NostrContentComponent,
    PersonComponent,
    DevelopComponent,
    MotorcycleComponent,
    IcelandhorseComponent,
    BitcoinComponent,
    BlogDetailComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        NgbModule,
        FontAwesomeModule,
        VgCoreModule,
    ],
  providers: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {
}
