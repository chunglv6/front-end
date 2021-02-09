import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BriefCaseService, ContractService, RESOURCE, VehicleService } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  gender,
  STATUS_CONTRACT_PROFILE,
  ACTION_TYPE,
  HTTP_CODE,
} from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-briefcase-detail',
  templateUrl: './briefcase-detail.component.html',
  styleUrls: ['./briefcase-detail.component.scss'],
})
export class BriefcaseDetailComponent extends BaseComponent implements OnInit {
  titlePopup: string;
  formDetail: FormGroup;
  formDetailTcb: FormGroup;
  cusId: number;
  listCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  listDataDetail: any = {};
  listDataDetailTcb: any = {};
  dataSourceDetail: MatTableDataSource<any>;
  place: any = {};
  statusContractProfile = STATUS_CONTRACT_PROFILE;
  currentIndex = 0;
  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    // Sau sửa lại service brefcase
    private sharedDirectoryService: SharedDirectoryService,
    protected translateService: TranslateService,
    private _briefCaseService: BriefCaseService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _contractService?: ContractService,
    private _sharedDirectoryService?: SharedDirectoryService,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    protected _vehicleService?: VehicleService
  ) {
    super(actr, _briefCaseService, RESOURCE.CUSTOMER, toastr, translateService, dialog);
  }
  buildForm() {
    this.formDetail = this.fb.group({
      custTypeId: [''],
      custId: [''],
      custName: [''],
      birthDate: [''],
      gender: [''],
      documentNumber: [''],
      dateOfIssue: [''],
      placeOfIssue: [''],
    });
  }
  buildFormTcb() {
    this.formDetailTcb = this.fb.group({
      province: [''],
      district: [''],
      noticeAreaCode: [''],
      noticeStreet: [''],
      noticeAreaName: [''],
      noticePhoneNumber: [''],
      noticeEmail: [''],
      areaName: [''],
    });
  }
  ngOnInit() {
    this.buildForm();
    this.buildFormTcb();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'briefcase.type_paper', field: 'documentTypeName' },
      { i18n: 'briefcase.name_paper', field: 'fileName' },
      { i18n: 'briefcase.date_recie', field: 'createDate' },
      { i18n: 'briefcase.date_scan', field: 'scanDay' },
      { i18n: 'briefcase.status_gt', field: 'status' },
      { i18n: 'briefcase.download', field: 'download' },
    ];
    super.mapColumn();
    this.titlePopup =
      this.translateService.instant('briefcase.view') + ' ' + this.dataDialog.data.contractNo;
    this.bindDataNotify();
    this.getData();
  }
  onPageChange(event) {
    this.searchModel.startrecord = event.pageIndex;
    this.searchModel.pagesize = event.pageSize;
    this.getData();
  }
  // dowload file
  clickDowload(item) {
    this._contractService.downloadProfileByContract(item.contractProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }
  // Thông tin hồ sơ
  briefcaseDetail() {
    this.isLoading = true;
    this._briefCaseService.findOne(this.dataDialog.data.custId, '/customers').subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.listDataDetail = res.data.listData[0];
        this.dataModel.count = res.data.count;
        this.formDetail.patchValue(res.data.listData[0]);
        this.getListCustomerType();
        this.formDetail.controls.gender.setValue(
          this.formDetail.controls.gender.value
            ? gender.find(x => x.code === this.formDetail.controls.gender.value)?.value
            : ''
        );
        this.isLoading = false;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }
  async bindDataNotify() {
    this.briefcaseDetail();
    this.getListVehicle();
    await this.briefcaseDetailTcb();
    await this.getDetailArea();
  }
  // địa chỉ TCB
  async briefcaseDetailTcb() {
    this.isLoading = true;
    this.formDetailTcb.patchValue(
      (
        await this._contractService
          .findOne(this.dataDialog.data.contractId, `/customers/contracts`)
          .toPromise()
      ).data.listData[0]
    );
  }
  // Danh sách chứng từ đính kèm hồ sơ ATTACHMENTS PROFILE
  getData() {
    this.isLoading = true;
    this.searchModel.actTypeId = ACTION_TYPE.DANG_KY_KH;
    this._contractService
      .searchContractProfiles(this.searchModel, this.dataDialog.data.contractId)
      .subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this.dataSourceDetail = new MatTableDataSource(res.data.listData);
          this.totalRecord = res.data.count;
          this.isLoading = false;
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
  }
  getListCustomerType() {
    this.sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listCustomerType = res.data.map(val => {
        return {
          code: val.cust_type_id,
          value: val.name,
        };
      });
      const customerTypeName = this.listCustomerType.filter(
        cust => cust.code === this.listDataDetail.custTypeId
      )[0].value;
      this.formDetail.get('custTypeId').patchValue(customerTypeName);
    });
  }
  async getDetailArea() {
    // lấy thông tin xã
    this.place = (
      await this._sharedDirectoryService
        .getAddressByCode(this.formDetailTcb.controls.noticeAreaCode.value)
        .toPromise()
    ).data[0];
    this.formDetailTcb.controls.areaName.setValue(this.place.name);
    this.formDetailTcb.controls.district.setValue(
      (await this._sharedDirectoryService.getAddressByCode(this.place.district).toPromise()).data[0]
        .name
    );
    this.formDetailTcb.controls.province.setValue(
      (await this._sharedDirectoryService.getAddressByCode(this.place.province).toPromise()).data[0]
        .name
    );
  }
  getListVehicle() {
    this._vehicleService
      .searchVehiclesAssignRFID(null, this.dataDialog.data.contractId)
      .subscribe(rs => {
        if (rs.mess.code === 1) {
          this.dataModel.dataSourceWithRFID = rs.data.listData;
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
  }
  // onChangeIndex(event) {
  //   this.currentIndex = event;
  // }
}
