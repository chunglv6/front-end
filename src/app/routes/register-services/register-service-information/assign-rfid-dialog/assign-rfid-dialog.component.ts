import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';

@Component({
  selector: 'app-assign-rfid-dialog',
  templateUrl: './assign-rfid-dialog.component.html',
  styleUrls: ['./assign-rfid-dialog.component.scss']
})
export class AssignRfidDialogComponent extends BaseComponent implements OnInit {

  formAssignRfid: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
   }

  ngOnInit() {
    this.formAssignRfid = this.fb.group({
      seriFrom: ['', Validators.required]
    });
  }

  resetForm() {
    this.formAssignRfid.reset();
  }
}
