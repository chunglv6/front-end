import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';

@Component({
  selector: 'app-search-info-index',
  templateUrl: './search-info-index.component.html',
  styleUrls: ['./search-info-index.component.css'],
})
export class SearchInfoIndexComponent extends BaseComponent implements OnInit {
  constructor(public act: ActivatedRoute) {
    super(act, null, RESOURCE.CUSTOMER);
  }

  ngOnInit() {}
}
