import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ContractService, PERMISSION, RESOURCE, VehicleService } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { Shop } from '@app/core/models/shop';
import { BriefCaseService } from '@app/core/services/briefcase/brief-case.service';
import { CommonIMService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ACTION_TYPE,
  CONTRACT_PROFILE_STATUS,
  gender,
  HTTP_CODE,
  STATUS_BRIEFCASE,
} from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-briefcase-approve',
  templateUrl: './briefcase-approve.component.html',
  styleUrls: ['./briefcase-approve.component.css'],
})
export class BriefcaseApproveComponent extends BaseComponent implements OnInit {
  resultListData: MatTableDataSource<any>;
  listAction = [];
  formApproveSearch: FormGroup;
  formApproveDetail: FormGroup;
  resultList: MatTableDataSource<any>;
  listCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  fromDate = null;
  toDate = null;
  listDataAprroverDetail: any = {};
  custTypeId: number;
  custId: number;
  documentTypeId: number;
  signDateIssue = new Date();
  listOptionDocumentType = [];
  listGender = gender;
  statusBriefcase = STATUS_BRIEFCASE;
  result: string;
  shops: Shop[] = [];
  isLoadingShop = false;
  currentTabVehicle = 0;
  constructor(
    protected _translateService: TranslateService,
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
  visibleTable = false;
  typeImpacts = [
    {
      code: ACTION_TYPE.DANG_KY_KH,
      value: this._translateService.instant('briefcase.act_DangKy_KhachHang'),
    },
    {
      code: ACTION_TYPE.KYMOIHOPDONG,
      value: this._translateService.instant('briefcase.act_KyMoi_HopDong'),
    },
    {
      code: ACTION_TYPE.KYPHULUCHOPDONG,
      value: this._translateService.instant('briefcase.act_KyPhuLuc_HopDong'),
    },
    {
      code: ACTION_TYPE.CHUYENTHE,
      value: this._translateService.instant('briefcase.act_DoiThe_RFID'),
    },
  ];
  selectedRow: any = {};
  statuses = [
    {
      value: `${CONTRACT_PROFILE_STATUS.CHOTIEPNHAN},${CONTRACT_PROFILE_STATUS.BOSUNG}`,
      label: this._translateService.instant('common.default-select'),
    },
    {
      value: STATUS_BRIEFCASE.CHUATIEPNHAN,
      label: this._translateService.instant('briefcase.unreception'),
    },
    {
      value: STATUS_BRIEFCASE.BOSUNG,
      label: this._translateService.instant('briefcase.additional'),
    },
  ];
  ngOnInit() {
    this.dataModel.dateNow = new Date();
    this.isLoading = false;
    this.buildFormSearch();
    this.buildFormDetail();
    this.buildForm();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'briefcase.number_contract', field: 'contractNo' },
      { i18n: 'briefcase.number_paper', field: 'documentNumber' },
      { i18n: 'briefcase.type_custommer', field: 'custTypeName' },
      { i18n: 'buyTicket.name', field: 'custName' },
      { i18n: 'briefcase.type_impact', field: 'actionName' },
      { i18n: 'briefcase.date_impact', field: 'signDate', type: 'datetime' },
      { i18n: 'briefcase.status', field: 'profileStatus', type: 'custom' },
      { i18n: 'briefcase.reciever', field: 'createUser' },
      { i18n: 'briefcase.date_recie', field: 'createDate', type: 'datetime' },
      { i18n: 'briefcase.approve', field: 'approve', type: 'custom' },
    ];
    this.getListCustomerType();
    this.formSearch
      .get('shop')
      .valueChanges.pipe(
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
    this.disableForm();
  }

  buildForm() {
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
      fromDate: [''],
      toDate: [''],
      actTypeId: [''],
      profileStatus: [''],
      status: [''],
      startrecord: [''],
      pagesize: [this.pageSizeList[0]],
      plateNumber: [''],
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
  buildFormSearch() {
    this.formApproveSearch = this.fb.group({
      code: [''],
      numberContract: [''],
      numberPaper: [''],
      licensePlates: [''],
      codeCustomer: [''],
      typeCustomer: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      agency: ['', Validators.required],
      typeImpact: [''],
      status: [''],
      personSign: ['', Validators.required],
      addressIssue: ['', Validators.required],
    });
  }
  buildFormDetail() {
    this.formApproveDetail = this.fb.group({
      contractNo: ['', Validators.required],
      signDate: ['', Validators.required],
      noticeName: ['', Validators.required],
      effDate: ['', Validators.required],
      expDate: ['', Validators.required],
      signName: ['', Validators.required],
      signBirthDate: ['', [Validators.required, ValidationService.checkAge]],
      signGender: [''],
      documentType: ['', Validators.required],
      signNumber: ['', Validators.required],
      signDateIssue: ['', Validators.required],
      signPlaceIssue: ['', Validators.required],
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
  // tra cuu thong tin phe duyet ho so
  searchBriefcaseApprove() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }
  getData() {
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
          `${CONTRACT_PROFILE_STATUS.CHOTIEPNHAN},${CONTRACT_PROFILE_STATUS.BOSUNG}`
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
  detailApprove(record) {
    this.selectedRow = record;
    this.visibleTable = true;
    this._contractService.searchDetailsContract(null, record.contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.listDataAprroverDetail = res.data;
        this.getListDocumentTypeByCustomer(record.custTypeId);
        this.getVehiclesByContractId(record.contractId);
        this.patchValueForm(res.data.listData[0]);
        this.formApproveDetail.controls.signGender.setValue(res.data.listData[0].gender);
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }
  // map data vào formcontrolname
  patchValueForm(formValue) {
    this.formApproveDetail.patchValue({
      contractNo: formValue.contractNo,
      signDate: moment(formValue.signDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      noticeName: formValue.noticeName,
      effDate: moment(formValue.effDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      expDate: moment(formValue.expDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      signName: formValue.signName,
      signBirthDate: moment(formValue.signBirthDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      signGender: formValue.signGender,
      documentType: formValue.documentType,
      signNumber: formValue.signNumber,
      signDateIssue: moment(formValue.signDateIssue, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      signPlaceIssue: formValue.signPlaceIssue,
    });
  }
  // lay danh sach loai giay to
  getListDocumentTypeByCustomer(custTypeId) {
    this._sharedDirectoryService.getListDocumentTypeByCustomer(custTypeId).subscribe(res => {
      this.listOptionDocumentType = res.data;
      this.formApproveDetail.get('documentType').patchValue(custTypeId);
    });
  }
  // lay danh sach phuong tien theo contractId
  getVehiclesByContractId(contractId) {
    this._vehicleService.searchVehiclesAssignRFID(null, contractId).subscribe(rs => {
      if (rs.mess.code === 1) {
        this.dataModel.dataSourceWithRFID = rs.data.listData;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }

  // complete handle
  displayFn(shop: Shop) {
    if (shop) {
      return shop.name;
    }
  }
  // only build active tab
  changeTabVehicle(event) {
    this.currentTabVehicle = event;
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
