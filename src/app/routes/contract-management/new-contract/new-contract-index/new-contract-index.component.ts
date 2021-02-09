import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';

@Component({
  selector: 'new-contract-index',
  templateUrl: './new-contract-index.component.html'
})
export class SignNewContractComponent extends BaseComponent implements OnInit {

  constructor(public act: ActivatedRoute) {
    super(act, null, RESOURCE.CONTRACT);
  }

  ngOnInit() {
  }

}
