import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MergeContractComponent } from './merge-contract-index/merge-contract-index.component';

const routes: Routes = [
    {
      path: '',
      component: MergeContractComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class MergeContractRoutingModule { }