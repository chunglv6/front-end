import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';

@Component({
  selector: 'search-contract-index',
  templateUrl: './search-contract-index.component.html'
})
export class SearchContractIndexComponent extends BaseComponent implements OnInit {

  constructor(public act: ActivatedRoute) { 
    super(act, null, RESOURCE.CONTRACT);
  }

  ngOnInit() {
  }

}