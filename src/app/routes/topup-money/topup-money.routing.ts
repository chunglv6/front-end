import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'config',
    loadChildren: () =>
      import('./config/config.module').then(
        m => m.TopupMoneyConfigModule
      ),
    data: {
      title: 'menu.topup-money.config',
    },
  },
  {
    path: 'topup',
    loadChildren: () =>
      import('./topup/topup.module').then(
        m => m.TopupModule
      ),
    data: {
      title: 'menu.topup-money.config',
    },
  },
];

export const TopupMoneyRoutes = RouterModule.forChild(routes);
