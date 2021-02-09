import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SearchContractIndexComponent } from './search-contract-index/search-contract-index.component';

//author hieulx

const routes: Routes = [
  {
    path: '',
    component: SearchContractIndexComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchContractRoutingModule { }
