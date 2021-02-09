import { Component, OnInit, Inject } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { HistoryActionService } from '@app/core/services/action-history/history-action.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MtxDialog } from '@ng-matero/extensions';
import { SharedDirectoryService } from '@app/shared';
import { RESOURCE } from '@app/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-history-action-detail',
  templateUrl: './history-action-detail.component.html',
  styleUrls: ['./history-action-detail.component.css']
})
export class HistoryActionDetailComponent extends BaseComponent implements OnInit {
  actionId: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public actr: ActivatedRoute,
    private _historyActionService: HistoryActionService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public sharedDirectoryService?: SharedDirectoryService,
  ) {
    super(actr, _historyActionService, RESOURCE.CUSTOMER, toastr, translateService, dialog);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'search-information.time-change', field: 'createDate' },
      { i18n: 'search-information.table-change', field: 'tableName' },
      { i18n: 'search-information.old-value', field: 'oldValue' },
      { i18n: 'search-information.new-value', field: 'newValue' }
    ];
    super.mapColumn();
    this.displayedColumns = this.columns.map(x => x.field);
    this.historyActionDetail();
  }
  historyActionDetail() {
    this.isLoading = true;
    this._historyActionService.findOne(this.data.data.actionAuditId, '/action-histories').subscribe(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
      this.isLoading = false;
    });
  }
  onPageChangeDetail(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.historyActionDetail();
  }
}
