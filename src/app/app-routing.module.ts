import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomeComponent} from "./main-content/welcome/welcome.component";
import {PersonComponent} from "./main-content/person/person.component";
import {DevelopComponent} from "./main-content/develop/develop.component";
import {MotorcycleComponent} from "./main-content/motorcycle/motorcycle.component";
import {IcelandhorseComponent} from "./main-content/icelandhorse/icelandhorse.component";
import {BitcoinComponent} from "./main-content/bitcoin/bitcoin.component";
import {BlogDetailComponent} from "./main-content/blog-detail/blog-detail.component";

const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
  {
    path: 'me',
    component: PersonComponent,
  },
  {
    path: 'develop',
    component: DevelopComponent,
  },
  {
    path: 'develop/blog/:identifier',
    component: BlogDetailComponent,
    data: {
      pubKey: 'f838b6a03d8d0127a9a98e87c0142b528916a4336ba537e14131a2f513becc17',
      backRoute: '/develop',
      backgroundImage: '/assets/clionheader.webp'
    }
  },
  {
    path: 'motorcycle',
    component: MotorcycleComponent,
  },
  {
    path: 'motorcycle/blog/:identifier',
    component: BlogDetailComponent,
    data: {
      pubKey: 'a2b949da49e6c8fddb7000bfe78eb846402f30c1b3a576dabe06081303ef030c',
      backRoute: '/motorcycle',
      backgroundImage: '/assets/zx10r_tire.webp'
    }
  },
  {
    path: 'icelandhorse',
    component: IcelandhorseComponent,
  },
  {
    path: 'bitcoin',
    component: BitcoinComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
