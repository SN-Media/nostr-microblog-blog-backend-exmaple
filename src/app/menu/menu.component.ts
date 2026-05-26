import {Component, Input} from '@angular/core';
import { faMotorcycle, faCode, faUser, faHorse } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: false
})
export class MenuComponent {
  faMotorcycle = faMotorcycle;
  faCode = faCode;
  faUser = faUser;
  faHorse = faHorse;
  faBitcoin = faBitcoin;

  @Input()
  outerClickHandler: () => void = () => {};

  menuItemClick(routerLink: string): void {
    const link = document.querySelectorAll('a.active');
    link.forEach(value => {
      value.classList.remove("active");
    })
    const clickedLink = document.querySelector('a[routerLink="' + routerLink + '"]');
    clickedLink?.classList.add("active")

    this.outerClickHandler();
  }
}
