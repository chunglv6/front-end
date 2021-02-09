import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { CanComponentDeactivate } from '@app/core/guards/can-dead-active';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-customer-register',
  templateUrl: './customer-register.component.html',
  styleUrls: ['./customer-register.component.scss']
})
export class CustomerRegisterComponent extends BaseComponent implements OnInit, CanComponentDeactivate {

  isDirty = false;
  constructor(public actr: ActivatedRoute,
    private _translateService: TranslateService,
    private _dialog: MatDialog,
  ) {
    super(actr, null, RESOURCE.CUSTOMER);
  }
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.isDirty) {
      const dialogData: ConfirmCloseDialog = {
        title: this._translateService.instant('common.confirm.back.title'),
        message: this._translateService.instant('common.confirm.back.content'),
        messageBold: this._translateService.instant('common.confirm.back.contentBold')
      };
      const confirm = this._dialog.open(ConfirmCloseDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      return confirm.afterClosed().toPromise();
    } else {
      return true;
    }

  }

  ngOnInit() {

  }
  getForm(event) {
    this.isDirty = event;
  }

}
