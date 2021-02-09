import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';

@Component({
  selector: 'app-briefcase-denial',
  templateUrl: './briefcase-denial.component.html',
  styleUrls: ['./briefcase-denial.component.css'],
})
export class BriefcaseDenialComponent extends BaseComponent implements OnInit {
  constructor(private fb: FormBuilder, private dialoRef: MatDialogRef<BriefcaseDenialComponent>) {
    super();
  }

  ngOnInit() {
    this.buildFormSearch();
  }
  buildFormSearch() {
    this.formSearch = this.fb.group({
      reason: ['', Validators.required],
    });
  }
  clickDenial() {
    this.dialoRef.close(this.formSearch.value);
  }
}
