import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';

@Component({
    selector: 'end-contract-index',
    templateUrl: './end-contract-index.component.html'
  })
  export class EndContractComponent extends BaseComponent implements OnInit {
  
    constructor(public act: ActivatedRoute) { 
      super(act, null, RESOURCE.CONTRACT);
    }
  
    ngOnInit() {
    }
  
  }