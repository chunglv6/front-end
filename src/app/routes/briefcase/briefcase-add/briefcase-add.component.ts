import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContractService, PERMISSION, RESOURCE, VehicleService } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { Shop } from '@app/core/models/shop';
import { BriefCaseService } from '@app/core/services/briefcase/brief-case.service';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ACTION_TYPE,
  CONTRACT_PROFILE_STATUS,
  gender,
  HTTP_CODE,
  STATUS_BRIEFCASE,
} from '@app/shared/constant/common.constant';
import { CommonIMService } from '@app/shared/services/common-im.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { iif } from 'rxjs';

@Component({
  selector: 'app-briefcase-add',
  templateUrl: './briefcase-add.component.html',
  styleUrls: ['./briefcase-add.component.css'],
})
export class BriefcaseAddComponent extends BaseComponent implements OnInit {
  formBriefcaseAdd: FormGroup;
  formApproveDetail: FormGroup;
  listAction = [];
  listCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  listDataBriefcaseAddDetail: any = {};
  listGender = gender;
  selectedRow: any = {};
  isLoadingShop = false;
  shops: Shop[] = [];
  list = [];
  visibleTable = false;
  statusBriefcase = STATUS_BRIEFCASE;
  currentTabVehicle = 0;
  listOptionDocumentType = [];
  allStatus = `${CONTRACT_PROFILE_STATUS.TUCHOI},${CONTRACT_PROFILE_STATUS.CHOTIEPNHAN}`;
  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _briefCaseService: BriefCaseService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _sharedDirectoryService?: SharedDirectoryService,
    private _contractService?: ContractService,
    protected _vehicleService?: VehicleService,
    protected _commonIMService?: CommonIMService
  ) {
    super(actr, _briefCaseService, RESOURCE.PROFILE, toastr, translateService, dialog);
    if (this.hasPermission(PERMISSION.UPDATE)) {
      this.listAction.push({
        icon: 'edit',
        tooltip: 'Edit',
        type: 'icon',
        // click: record => this.edit(record),
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
  statuses = [
    {
      value: `${CONTRACT_PROFILE_STATUS.TUCHOI},${CONTRACT_PROFILE_STATUS.CHOTIEPNHAN}`,
      label: this.translateService.instant('common.default-select'),
    },
    {
      value: STATUS_BRIEFCASE.CHUATIEPNHAN,
      label: this.translateService.instant('briefcase.unreception'),
    },
    { value: STATUS_BRIEFCASE.BITUCHOI, label: this.translateService.instant('briefcase.deny') },
  ];
  typeImpacts = [
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
  ngOnInit() {
    this.dataModel.dateNow = new Date();
    this.isLoading = false;
    this.buildFormSearch();
    this.buildFormDetail();
    this.getListCustomerType();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'briefcase.number_contract', field: 'contractNo' },
      { i18n: 'briefcase.number_paper', field: 'documentNumber' },
      { i18n: 'customer.name', field: 'custName' },
      { i18n: 'briefcase.type_impact', field: 'actionName' },
      { i18n: 'briefcase.date_impact', field: 'createDate', type: 'datetime' },
      { i18n: 'briefcase.implementer', field: 'createUser' },
      { i18n: 'briefcase.status', field: 'profileStatus', type: 'custom' },
      { i18n: 'briefcase.person_appr', field: 'approvedUser' },
      { i18n: 'briefcase.until_add', field: 'expDate', type: 'datetime' },
      { i18n: 'common.action', field: 'action', type: 'custom' },
    ];
    this.formSearch
      .get('shop')
      .valueChanges.pipe(
        debounceTime(1000),
        tap((() => {
          this.isLoadingShop = true;
          this.shops = [];
        })),
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

    this.disableForm();
  }
  buildFormDetail() {
    this.formApproveDetail = this.fb.group({
      contractNo: ['', Validators.required],
      signDate: ['', Validators.required],
      noticeName: ['', Validators.required],
      effDate: [''],
      expDate: [''],
      signName: [
        '',
        [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace],
      ],
      signBirthDate: ['', [Validators.required, ValidationService.checkAge]],
      signGender: ['', Validators.required],
      documentType: ['', Validators.required],
      signNumber: ['', Validators.required],
      signDateIssue: ['', Validators.required],
      signPlaceIssue: [
        '',
        [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace],
      ],
    });
  }
  buildFormSearch() {
    this.formSearch = this.fb.group({
      contractNo: [''],
      documentNumber: [''],
      custId: [''],
      custTypeId: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      shop: [
        '',
        [Validators.required, ValidationService.cannotWhiteSpace, ValidationService.checkObject],
      ],
      shopId: null,
      fromDate: [''],
      toDate: [''],
      actTypeId: [''],
      status: [''],
      profileStatus: [''],
      startrecord: [''],
      plateNumber: [''],
      pagesize: [this.pageSizeList[0]],
    });
  }
  getVehiclesByContractId(contractId) {
    this._vehicleService.searchVehiclesAssignRFID(null, contractId).subscribe(rs => {
      if (rs.mess.code === 1) {
        this.dataModel.dataSourceWithRFID = rs.data.listData;
      } else {
        this.toastr.warning(rs.mess.description);
      }
    },
      error => {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      });
  }
  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listCustomerType = res.data.map(val => {
        return {
          id: val.cust_type_id,
          value: val.name,
        };
      });
    });
  }
  patchValueForm(formValue) {
    this.formApproveDetail.patchValue({
      contractNo: formValue.contractNo,
      signDate: moment(formValue.signDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      noticeName: formValue.noticeName,
      effDate: formValue.effDate
        ? moment(formValue.effDate, COMMOM_CONFIG.DATE_FORMAT).toDate()
        : null,
      expDate: formValue.expDate
        ? moment(formValue.expDate, COMMOM_CONFIG.DATE_FORMAT).toDate()
        : null,
      signName: formValue.signName,
      signBirthDate: moment(formValue.signBirthDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      signGender: formValue.signGender,
      documentType: formValue.documentType,
      signNumber: formValue.signNumber,
      signDateIssue: moment(formValue.signDateIssue, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      signPlaceIssue: formValue.signPlaceIssue,
    });
  }
  detailBriefCaseAdd(record) {
    this.selectedRow = record;
    this.visibleTable = true;
    this.isLoading = true;
    this._contractService.searchDetailsContract(null, record.contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.listDataBriefcaseAddDetail = res.data;
        this.getListDocumentTypeByCustomer(record.custTypeId);
        this.getVehiclesByContractId(record.contractId);
        this.patchValueForm(res.data.listData[0]);
        this.isLoading = false;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }
  // tra cuu thong tin ho so bo xung
  searchBriefcaseAdd() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }
  getData() {
    this.selectedRow = {};
    this.visibleTable = false;
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
      this.formSearch.controls.profileStatus.setValue(this.formSearch.controls.status.value);
      if (!this.formSearch.controls.profileStatus.value) {
        this.formSearch.controls.profileStatus.setValue(
          `${CONTRACT_PROFILE_STATUS.TUCHOI},${CONTRACT_PROFILE_STATUS.CHOTIEPNHAN}`
        );
      }
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
  displayFn(shop: Shop) {
    if (shop) {
      return shop.name;
    }
  }
  changeTabVehicle(event) {
    this.currentTabVehicle = event;
  }
  getListDocumentTypeByCustomer(custTypeId) {
    this._sharedDirectoryService.getListDocumentTypeByCustomer(custTypeId).subscribe(res => {
      this.listOptionDocumentType = res.data;
      this.formApproveDetail
        .get('documentType')
        .setValue(this.listOptionDocumentType.find(x => x.id === custTypeId)?.val);
    });
  }
  disableForm() {
    this.formApproveDetail.controls.contractNo.disable();
    this.formApproveDetail.controls.signDate.disable();
    this.formApproveDetail.controls.noticeName.disable();
    this.formApproveDetail.controls.effDate.disable();
    this.formApproveDetail.controls.expDate.disable();
    this.formApproveDetail.controls.documentType.disable();
    this.formApproveDetail.controls.signNumber.disable();
  }
}
