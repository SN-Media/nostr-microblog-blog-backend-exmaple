import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  title = 'robertstiehler.me';

  clickMenu(event: any) {
    this.toggleMenu();
  }

  clickMarginalContent(event: any) {
    this.toggleMarginalContent();
  }

  toggleMenu() {
    const menu = document.querySelector('.menu-bar') as HTMLElement;
    console.info('Toggling menu visibility');
    if (menu.classList.contains('hideOnPhone')) {
      menu.classList.remove('hideOnPhone');
      menu.classList.add('showOnPhone');
    }
    else if(menu.classList.contains('showOnPhone')) {
      menu.classList.remove('showOnPhone');
      menu.classList.add('hideOnPhone');
    }
  }

  toggleMarginalContent() {
    const marginalContent = document.querySelector('.marginal-content') as HTMLElement;
    const button = document.querySelector('.marginal-content-expander') as HTMLElement;
    console.info('Toggling marginal content visibility');
    if (marginalContent.classList.contains('hideOnPhone')) {
      marginalContent.classList.remove('hideOnPhone');
      marginalContent.classList.add('showOnPhone');
      button.classList.remove("invert")
    }
    else if(marginalContent.classList.contains('showOnPhone')) {
      marginalContent.classList.remove('showOnPhone');
      marginalContent.classList.add('hideOnPhone');
      button.classList.add("invert")
    }
  }
}
