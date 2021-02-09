import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-license',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmLicenseComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmDialogBoldFormComponent>,
    protected translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: CustomerModelConfirm) {
  }
  ngOnInit(): void {
    if (!this.data.nameButtonConfirm) {
      this.data.nameButtonConfirm = this.translateService.instant('common.button.confirm');
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}
export interface CustomerModelConfirm {
  title: string;
  messageFirst: string;
  messageBold: string;
  messageLast: string;
  nameButtonConfirm?: string;
  messageSecond?: string;
}
