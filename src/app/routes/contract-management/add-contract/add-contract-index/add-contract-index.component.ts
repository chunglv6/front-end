import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';

@Component({
  selector: 'add-contract-index',
  templateUrl: './add-contract-index.component.html'
})
export class AddContractComponent extends BaseComponent implements OnInit {

  constructor(public act: ActivatedRoute) { 
    super(act, null, RESOURCE.CONTRACT);
  }

  ngOnInit() {
  }

}