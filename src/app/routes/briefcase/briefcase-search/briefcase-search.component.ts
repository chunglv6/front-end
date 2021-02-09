import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PERMISSION, RESOURCE } from '@app/core';
import { Shop } from '@app/core/models/shop';
import { BriefCaseService } from '@app/core/services/briefcase/brief-case.service';
import { CommonIMService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ACTION_TYPE, HTTP_CODE, STATUS_BRIEFCASE } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { iif, Subscription } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { BriefcaseDetailComponent } from '../briefcase-detail/briefcase-detail.component';

@Component({
  selector: 'app-briefcase-search',
  templateUrl: './briefcase-search.component.html',
  styleUrls: ['./briefcase-search.component.css'],
})
export class BriefcaseSearchComponent extends BaseComponent implements OnInit, OnDestroy {
  formSearch: FormGroup;
  listAction = [];
  listCustomerType = [];
  isLoadingShop = false;
  shops: Shop[] = [];
  typeImpacts = [];
  statusBriefCase = STATUS_BRIEFCASE;
  sub: Subscription;
  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _briefCaseService: BriefCaseService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public sharedDirectoryService?: SharedDirectoryService,
    private _commonIMService?: CommonIMService
  ) {
    super(actr, _briefCaseService, RESOURCE.PROFILE, toastr, translateService, dialog);
    if (this.hasPermission(PERMISSION.UPDATE)) {
      this.listAction.push({
        icon: 'edit',
        tooltip: 'Edit',
        type: 'icon',
      });
    }

    if (this.hasPermission(PERMISSION.DELETE)) {
      this.listAction.push({
        icon: 'delete',
        tooltip: 'Delete',
        color: 'warn',
        type: 'icon',
        // click: record => this.delete(record),
      });
    }
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  statuses = [
    {
      value: STATUS_BRIEFCASE.CHUATIEPNHAN,
      label: this.translateService.instant('briefcase.unreception'),
    },
    {
      value: STATUS_BRIEFCASE.DAPHEDUYET,
      label: this.translateService.instant('briefcase.approval'),
    },
    { value: STATUS_BRIEFCASE.BITUCHOI, label: this.translateService.instant('briefcase.deny') },
    {
      value: STATUS_BRIEFCASE.BOSUNG,
      label: this.translateService.instant('briefcase.additional'),
    },
  ];
  ngOnInit() {
    this.typeImpacts = [
      {
        code: ACTION_TYPE.DANG_KY_KH,
        value: this.translateService.instant('briefcase.act_DangKy_KhachHang'),
      },
      {
        code: ACTION_TYPE.KYMOIHOPDONG,
        value: this.translateService.instant('briefcase.act_KyMoi_HopDong'),
      },
      {
        code: ACTION_TYPE.KYPHULUCHOPDONG,
        value: this.translateService.instant('briefcase.act_KyPhuLuc_HopDong'),
      },
      {
        code: ACTION_TYPE.CHUYENTHE,
        value: this.translateService.instant('briefcase.act_DoiThe_RFID'),
      },
    ];
    this.buildForm();
    this.isLoading = false;
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'briefcase.number_contract', field: 'contractNo' },
      { i18n: 'briefcase.code_custommer', field: 'custId' },
      { i18n: 'briefcase.number_paper', field: 'documentNumber' },
      { i18n: 'briefcase.dateSigHD', field: 'signDate', type: 'datetime' },
      { i18n: 'briefcase.reciever', field: 'createUser' },
      { i18n: 'briefcase.date_recie', field: 'createDate', type: 'datetime' },
      { i18n: 'action_audit.actionType', field: 'actionName' },
      { i18n: 'briefcase.status', field: 'profileStatus', type: 'custom' },
      { i18n: 'briefcase.viewFile', field: 'viewFile', type: 'custom' },
    ];
    this.getListCustomerType();
    this.sub = this.formSearch.controls.shop.valueChanges
      .pipe(
        debounceTime(1000),
        tap(() => {
          this.isLoadingShop = true;
          this.shops = [];
        }),
        switchMap(value =>
          iif(
            () => typeof value !== 'object',
            this._commonIMService.getListShops({ startrecord: 0, pagesize: 20, name: value }, true),
            null
          ).pipe(finalize(() => (this.isLoadingShop = false)))
        )
      )
      .subscribe(rs => {
        this.shops = rs.data.listData;
      });
  }
  buildForm() {
    this.formSearch = this.fb.group({
      contractNo: [''],
      documentNumber: [''],
      plateNumber: [''],
      custId: [''],
      custTypeId: [''],
      fromDate: [''],
      toDate: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      shop: [
        '',
        [Validators.required, ValidationService.cannotWhiteSpace, ValidationService.checkObject],
      ],
      actTypeId: [''],
      profileStatus: [''],
      startrecord: [''],
      pagesize: [this.pageSizeList[0]],
    });
  }
  // link component xem chi tiết hồ sơ
  viewDetail(record?) {
    this.dialog.open(
      {
        width: '80%',
        data: record,
      },
      BriefcaseDetailComponent
    );
  }
  getListCustomerType() {
    this.sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listCustomerType = res.data.map(val => {
        return {
          id: val.cust_type_id,
          value: val.name,
        };
      });
    });
  }
  // Tra cuu ho so
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }
  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      this.formSearch.controls.fromDate.setValue(
        this.formSearch.controls.startDate.value
          ? moment(this.formSearch.controls.startDate.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
          : null
      );
      this.formSearch.controls.toDate.setValue(
        this.formSearch.controls.endDate.value
          ? moment(this.formSearch.controls.endDate.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
          : null
      );
      this.formSearch.value.shopId = this.formSearch.value.shop.id;
      this._briefCaseService.searchBriefCase(this.formSearch.value).subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = res.data.listData;
          this.totalRecord = res.data.count;
          this.isLoading = false;
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
    }
  }
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }
  displayFn(shop: Shop) {
    if (shop) {
      return shop.name;
    }
  }
}
