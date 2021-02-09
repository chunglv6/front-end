import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'search-contract',
    loadChildren: () => import('./search-contract/search-contract.module').then(m => m.SearchContractModule),
    data: {
      title: 'menu.contract-management.search-contract'
    }
  },
  {
    path: 'add-contract',
    loadChildren: () => import('./add-contract/add-contract.module').then(m => m.AddContractModule),
    data: {
      title: 'menu.contract-management.sign-new-contract'
    }
  },
  {
    path: 'new-contract',
    loadChildren: () => import('./new-contract/new-contract.module').then(m => m.SignNewContractModule),
    data: {
      title: 'menu.contract-management.sign-new-contract'
    }
  },
  {
    path: 'appendix-contract',
    loadChildren: () => import('./appendix-contract/appendix-contract.module').then(m => m.SignAppendixContractModule),
    data: {
      title: 'menu.contract-management.sign-appendix-contract'
    }
  },
  {
    path: 'detach-contract',
    loadChildren: () => import('./detach-contract/detach-contract.module').then(m => m.DetachContractModule),
    data: {
      title: 'menu.contract-management.detach-contract'
    }
  },
  {
    path: 'merge-contract',
    loadChildren: () => import('./merge-contract/merge-contract.module').then(m => m.MergeContractModule),
    data: {
      title: 'menu.contract-management.merge-contract'
    }
  },
  {
    path: 'end-contract',
    loadChildren: () => import('./end-contract/end-contract-module').then(m => m.EndContractModule),
    data: {
      title: 'menu.contract-management.end-contract'
    }
  }
];

export const ContractRoutingModule = RouterModule.forChild(routes);
