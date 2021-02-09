import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MtxDialog } from '@ng-matero/extensions';
import { SharedDirectoryService } from '@app/shared';
import { RESOURCE } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { OBJECTS_ACTION, STATUS_ACTION } from '@app/shared/constant/common.constant';
import moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { HistoryActionService } from '@app/core/services/action-history/history-action.service';
import { HistoryActionDetailComponent } from './history-action-detail/history-action-detail.component';
import { COMMOM_CONFIG } from '@env/environment';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { saveAs } from 'file-saver';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-history-action',
  templateUrl: './search-history-action.component.html',
  styleUrls: ['./search-history-action.component.css']
})

export class SearchHistoryActionComponent extends BaseComponent implements OnInit {
  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _historyActionService: HistoryActionService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public sharedDirectoryService?: SharedDirectoryService,
    private _commonCRMService?: CommonCRMService,
  ) {
    super(actr, _historyActionService, RESOURCE.SEARCH, toastr, translateService, dialog);
    this.formSearch = this.fb.group({
      dateInStart: ['', Validators.required],
      dateInEnd: ['', Validators.required],
      actionEmployee: ['']
    });
  }
  startDate = null;
  endDate = null;
  listCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  objectAction = OBJECTS_ACTION;
  statusAction = STATUS_ACTION;
  dataSource: MatTableDataSource<any>;
  searchModelExcel: any = {};

  actionType = [];
  actionObject = [
    { value: OBJECTS_ACTION.TATCA, label: this.translateService.instant('common.default-select') },
    { value: OBJECTS_ACTION.KHACHHANG, label: this.translateService.instant('search-information.custommer') },
    { value: OBJECTS_ACTION.HOPDONG, label: this.translateService.instant('search-information.contract') },
    { value: OBJECTS_ACTION.PHUONGTIEN, label: this.translateService.instant('search-information.vehicle') },
    { value: OBJECTS_ACTION.THERFID, label: this.translateService.instant('search-information.rfid') },
  ];
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer.code', field: 'custId' },
      { i18n: 'customer.name', field: 'custName' },
      { i18n: 'search-information.obj-action', field: 'actObject' },
      { i18n: 'briefcase.type_impact', field: 'actionTypeName' },
      { i18n: 'search-information.action-reason', field: 'actionReasonName' },
      { i18n: 'action_audit.createBy', field: 'actionUserFullName' },
      { i18n: 'action_audit.create', field: 'createDate' },
      { i18n: 'search-information.action-status', field: 'status' },
      { i18n: 'search-information.action-detail', field: 'viewHistoryAction' }
    ];
    super.mapColumn();
    this.selectionChangeActionType();
    this.searchHistoryAction();
  }
  async selectionChangeActionType() {
    this.searchModel.actTypeId = null;
    if (this.searchModel.actObject) {
      this._commonCRMService.getActionType(this.searchModel.actObject).subscribe(rs => {
        if (rs.mess.code == 1) {
          this.actionType = rs.data.map(val => {
            return {
              code: val.actTypeId,
              value: val.name
            }
          });
        }
      })
    }
  }
  // tra cuu lich su tac dong
  searchHistoryAction(isViewPage?: boolean) {
    if (!isViewPage) {
      this.searchModel.startrecord = 0;
      this.pageIndex = 0;
    }
    this.isLoading = true;
    this.handleSearchModelTrim();
    this._historyActionService.searchHistoryAction(this.searchModel).subscribe(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
      this.isLoading = false;
    });
  }
  // xuat Excell to do
  exportFile() {
    this.handleSearchModelTrim();
    this.searchModelExcel = Object.assign({}, this.searchModel);
    delete this.searchModelExcel.startrecord;
    delete this.searchModelExcel.pagesize;
    this._historyActionService.exportExcel(this.searchModelExcel).subscribe(
      res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }
  viewDetail(record?) {
    this.dialog.open({
      width: '1000px',
      data: record,
    }, HistoryActionDetailComponent);
  }
  // xử lý load trang + pageIndex
  onPageChangeHistories(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.searchHistoryAction(true);
  }

  handleSearchModelTrim() {

    if (!this.searchModel.actObject) {
      delete this.searchModel.actObject;
    }

    if (!this.searchModel.actTypeId) {
      delete this.searchModel.actTypeId;
    }

    if (!this.searchModel.custName) {
      delete this.searchModel.custName;
    } else {
      this.searchModel.custName = this.searchModel.custName.trim();
    }
    if (!this.searchModel.tableName) {
      delete this.searchModel.tableName;
    } else {
      this.searchModel.tableName = this.searchModel.tableName.trim();
    }
    if (!this.searchModel.phoneNumber) {
      delete this.searchModel.phoneNumber;
    } else {
      this.searchModel.phoneNumber = this.searchModel.phoneNumber.trim();
    }
    if (!this.searchModel.documentNumber) {
      delete this.searchModel.documentNumber;
    } else {
      this.searchModel.documentNumber = this.searchModel.documentNumber.trim();
    }
    if (!this.searchModel.contractNo) {
      delete this.searchModel.contractNo;
    } else {
      this.searchModel.contractNo = this.searchModel.contractNo.trim();
    }
    if (!this.searchModel.plateNumber) {
      delete this.searchModel.plateNumber;
    } else {
      this.searchModel.plateNumber = this.searchModel.plateNumber.trim();
    }
    if (!this.searchModel.rfidSerial) {
      delete this.searchModel.rfidSerial;
    } else {
      this.searchModel.rfidSerial = this.searchModel.rfidSerial.trim();
    }
    if (!this.formSearch.controls.actionEmployee.value) {
      delete this.searchModel.actionUserFullName;
    } else {
      this.searchModel.actionUserFullName = this.formSearch.controls.actionEmployee.value.trim();
    }
    this.searchModel.startDate = this.startDate ? moment(this.startDate).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.endDate = this.endDate ? moment(this.endDate).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    if (!this.searchModel.startDate) {
      delete this.searchModel.startDate;
    }
    if (!this.searchModel.endDate) {
      delete this.searchModel.endDate;
    }
  }
}
