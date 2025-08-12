import { Routes } from '@angular/router';

export const routes: Routes = [
      {
            path: 'eco-ui',
            loadComponent: () =>
                  import('./eco-ui/eco-ui').then(m => m.EcoUi),
            title: 'Ecoview'
      },
];
