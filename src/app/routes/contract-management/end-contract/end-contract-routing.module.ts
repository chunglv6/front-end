import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { EndContractComponent } from './end-contract-index/end-contract-index.component';

const routes: Routes = [
    {
      path: '',
      component: EndContractComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class EndContractRoutingModule { }