import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app/core/services/policy/ticket-prices.service';
import { CanComponentDeactivate } from '@app/core/guards/can-dead-active';
import { Observable } from 'rxjs';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MtxDialog } from '@ng-matero/extensions';

@Component({
  selector: 'app-pricelist-add',
  templateUrl: './pricelist-add.component.html',
  styleUrls: ['./pricelist-add.component.scss']
})
export class PricelistAddComponent extends BaseComponent implements OnInit, CanComponentDeactivate {
  indexTab;
  isEdit = false;
  dirty = false;

  constructor(
    protected translateService: TranslateService,
    route: ActivatedRoute,
    public dialog?: MtxDialog,
    private dataReceiver?: DataService,
  ) {
    super();
    route.params.subscribe(params => {
      if (params.servicePlanId == null)
        this.isEdit = true;
    });
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.dirty) {
      const dialogData: ConfirmCloseDialog = {
        title: this.translateService.instant('common.confirm.back.title'),
        message: this.translateService.instant('common.confirm.back.content'),
        messageBold: this.translateService.instant('common.confirm.back.contentBold')
      };
      const confirm = this.dialog.originalOpen(ConfirmCloseDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      return confirm.afterClosed().toPromise();
    } else {
      return true;
    }
  }

  ngOnInit() {
    this.dataReceiver.currentMessage.subscribe(message => {
      if(message == 'dirty'){
        this.dirty = true;
      }
    });
  }
  selectNode(event) {
    this.indexTab = event.type
  }
  onTabCustomerChange(tab) {

  }

}
