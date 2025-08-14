import { Routes } from '@angular/router';
import { Welcome } from './welcome/welcome';

export const routes: Routes = [
      {
            path: 'eco-ui',
            loadComponent: () =>
                  import('./eco-ui/eco-ui').then(m => m.EcoUi),
            title: 'Ecoview'
      },
      {
            path: '',
            loadComponent: () =>
                  import('./welcome/welcome').then(m => m.Welcome),
            title: 'Welcome' 
      }
];
