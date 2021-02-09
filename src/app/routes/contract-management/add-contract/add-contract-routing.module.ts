//author hieulx

import { Routes, RouterModule } from '@angular/router';
import { AddContractComponent } from './add-contract-index/add-contract-index.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
      path: '',
      component: AddContractComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AddContractRoutingModule { }