import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';

@Component({
  selector: 'detach-contract-index',
  templateUrl: './detach-contract-index.component.html'
})
export class DetachContractComponent extends BaseComponent implements OnInit {

  constructor(public act: ActivatedRoute) {
    super(act, null, RESOURCE.CONTRACT);
  }

  ngOnInit() {
  }

}
