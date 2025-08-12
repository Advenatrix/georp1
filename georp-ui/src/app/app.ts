import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true,
  imports: [RouterModule],
})
export class AppComponent {
  title = 'Georp UI';
  navLinks: NavLink[] = [
    { label: 'Home',  path: '/' },
    { label: 'Docs',  path: '/docs' },
    { label: 'About', path: '/about' },
    { path: 'eco-ui', label: 'Eco UI' },
  ];

  trackByLabel(_: number, link: NavLink) {
    return link.label;
  }
}
