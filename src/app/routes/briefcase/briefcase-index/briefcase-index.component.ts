import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';

@Component({
  selector: 'app-briefcase-index',
  templateUrl: './briefcase-index.component.html',
  styleUrls: ['./briefcase-index.component.css'],
})
export class BriefcaseIndexComponent extends BaseComponent implements OnInit {
  constructor(public act: ActivatedRoute) {
    super(act, null, RESOURCE.PROFILE);
  }

  ngOnInit() {}
}
