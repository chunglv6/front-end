import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { SearchContractRoutingModule } from './search-contract-routing.module';
import { SearchContractIndexComponent } from './search-contract-index/search-contract-index.component';
import { SearchContractSearchComponent } from './search-contract-search/search-contract-search.component';
import { FormsModule } from '@angular/forms';

//author hieulx

@NgModule({
  declarations: [
    SearchContractIndexComponent,
    SearchContractSearchComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    SearchContractRoutingModule,
  ],
  entryComponents: []
})
export class SearchContractModule { }