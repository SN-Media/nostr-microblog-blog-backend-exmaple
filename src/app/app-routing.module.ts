import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomeComponent} from "./main-content/welcome/welcome.component";
import {PersonComponent} from "./main-content/person/person.component";
import {DevelopComponent} from "./main-content/develop/develop.component";
import {MotorcycleComponent} from "./main-content/motorcycle/motorcycle.component";
import {IcelandhorseComponent} from "./main-content/icelandhorse/icelandhorse.component";
import {BitcoinComponent} from "./main-content/bitcoin/bitcoin.component";

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
    path: 'motorcycle',
    component: MotorcycleComponent,
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
