import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SignAppendixContractComponent } from './appendix-contract-index/appendix-contract-index.component';

const routes: Routes = [
  {
    path: '',
    component: SignAppendixContractComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignAppendixContractRoutingModule { }
