import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { DetachContractComponent } from './detach-contract-index/detach-contract-index.component';

const routes: Routes = [
    {
      path: '',
      component: DetachContractComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class DetachContractRoutingModule { }