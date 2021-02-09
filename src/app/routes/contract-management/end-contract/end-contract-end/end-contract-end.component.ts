// author hieulx

import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { ContractService } from '@app/core/services/contract/contract.service';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { PeriodicElement } from '@app/routes/customer-management/buy-ticket/buy-ticket.component';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { ACTION_TYPE, CUSTOMER_TYPE_ID, gender, HTTP_CODE, STATUS_CONTRACT } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { MtxGridColumn } from '@ng-matero/extensions';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'end-contract-end',
  templateUrl: './end-contract-end.component.html',
  styleUrls: ['./end-contract-end.component.scss']
})
export class EndContractEndComponent extends BaseComponent implements OnInit {
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];

  dataReasonType: any;
  @ViewChild('tableFee') tableFee: MatTable<any>;
  displayedColumnsFee = ['fee', 'price'];

  displayedColumnsContractEnd: string[] = ['orderNumberContractEnd', 'contractNo', 'signName', 'signDate', 'status', 'select'];

  listDataFee = [];
  dataFeesType = [];

  formSearch: FormGroup;
  columnsFee: MtxGridColumn[];

  selectedCustomer: any = {};
  value: string;
  states = [];
  filteredStates = this.states;
  listVehicleSource = [];
  @ViewChild('tableVehicleEnd') tableVehicleEnd: CrmTableComponent;
  selection = new SelectionModel<any>(true, []);
  columnsContractEnd: MtxGridColumn[];

  contractId: number;
  selectLicence: number;
  isDisbaleButton = false;
  CUSTOMER_TYPE_ID = CUSTOMER_TYPE_ID;

  listDataProfile = [];
  displayedColumnsProfile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  columnsProfile: MtxGridColumn[];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  indexPaginator = 0;
  pageSizeList = [10, 20, 50, 100];

  resultList = [];
  @Input() customerId: number;

  birthDayDate: string;
  dateOfIssue: String;
  isLoadingAuto: boolean;
  formInformation: FormGroup;

  actReasonId: number;
  constructor(
    protected _translateService: TranslateService,
    protected _translate: TranslateService,
    private _toastrService: ToastrService,
    private _customerInfoService: CustomerService,
    private _contractService: ContractService,
    private _commonCRMService: CommonCRMService,
    protected translateService: TranslateService,
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,

  ) {
    super(actr, RESOURCE.CONTRACT);

    this.columnsContractEnd = [
      { i18n: 'common.orderNumber', field: 'orderNumberContractEnd' },
      { i18n: 'contractDetach.contract-number', field: 'contractNo' },
      { i18n: 'contractDetach.sign-employee', field: 'signName' },
      { i18n: 'contractDetach.sign-date', field: 'signDate' },
      { i18n: 'common.status', field: 'status' },
    ];

    this.columnsFee = [
      { i18n: 'contract.feeType', field: 'fee', disabled: true },
      { i18n: 'contract.cost', field: 'price', disabled: true },
    ];

    super.mapColumn();
    this.displayedColumns = this.columns.map(x => x.field);
  }

  ngOnInit() {
    this.isLoading = false;

    this.formInformation = this.fb.group({
      searchContract: ['', Validators.required],
    });

    this.formSearch = this.fb.group({
      lydo: ['', Validators.required],
      license: [''],
    });

    this.getListDocumentTypeObject();
    this.getReason();
    this.getFeesReason(ACTION_TYPE.CHAM_DUT_HD);
    this.selectedCustomer.custTypeId = CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC;

    this.formInformation.get('searchContract').valueChanges.pipe(debounceTime(1000), tap(() => { this.isLoadingAuto = true; this.filteredStates = []; })).subscribe(value => {
      if (typeof value !== 'object') {
        this._customerInfoService.searchCustomerInfo(value.trim()).subscribe(rs => {
          this.isLoadingAuto = false;
          this.filteredStates = rs.data.listData;
        });
      }
    });
  }

  inItColumns() {
    this.translateService.get('customer-management.updateProfileTable').subscribe(res => {
      this.columnsProfile = [
        { i18n: res.stt, field: 'stt', disabled: true },
        { i18n: res.documentType, field: 'documentType', disabled: true },
        { i18n: res.documentName, field: 'documentName', disabled: true },
        { i18n: res.actionDelete, field: 'actionDelete', disabled: true }
      ];
    });
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  deleteProfile(i) {
    this.confirmDialogDeleteProfile(i);
  }

  // confirmDialogDeleteProfile(i): void {
  //   const message = this.translateService.instant('common.confirm.delete-file');
  //   const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.delete'), message);
  //   const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
  //     maxWidth: "400px",
  //     data: dialogData
  //   });

  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     if (dialogResult) {
  //       this.listDataProfile.splice(i + this.indexPaginator, 1);
  //       this.renderTable();
  //     }
  //   });
  // }

  confirmDialogDeleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
  }

  confirmDialog(value?: any): void {
    const dialogData: any = {
      title: this.translateService.instant('contract.finish-confirm-title'),
      message: this.translateService.instant('contractNew.question-end-contract'),
      messageBold: this.selectedCustomer.custName,
      btnConfirm: this.translateService.instant('contract.btn-finish')
    };
    const dialogRef = this.dialog.originalOpen(ConfirmCloseDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.endContracts();
      }
    });
  }
  redirectToDestination() { }
  redirectToContractPower() { }

  async filter(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStates = [];
    const data = (await this._customerInfoService.searchCustomerInfo(value.trim()).toPromise()).data;
    if (data.listData.length > 0) {
      this.filteredStates = data.listData;
    }
    return this.filteredStates;
  }

  getOptionText(option) {
    if (option) {
      return option.custName + ' - ' + option.documentNumber;
    }
  }

  onSelectedCustomer(event) {
    this.selectedCustomer = event.option.value;
    this.getData();
    const findGender = gender.find(x => x.code == this.selectedCustomer.gender);
    this.selectedCustomer.gender = findGender ? findGender.value : '';
    this.birthDayDate = this.selectedCustomer.birthDate ? this.selectedCustomer.birthDate.split(' ')[0] : null;
    this.dateOfIssue = this.selectedCustomer.dateOfIssue ? this.selectedCustomer.dateOfIssue.split(' ')[0] : null;
  }

  // load ra tất cả hợp đồng
  getData() {
    this._contractService.searchAllContracts({ custId: this.selectedCustomer.custId }).subscribe(res => {
      this.listVehicleSource = res.data.listData.filter(data => data.status == STATUS_CONTRACT.HOATDONG);
      this.totalRecord = this.listVehicleSource.length;
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.listVehicleSource.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.listVehicleSource.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.CHAM_DUT_HD).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val
        };
      });
    });
  }

  chooseFileChange(event) {
    this.formSearch.controls.lydo.clearValidators();
    this.formSearch.controls.lydo.updateValueAndValidity();
    this.chooseFileModal(event, AttachFileComponent);
  }

  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      panelClass: 'my-dialog',
      width: '600px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      this.formSearch.controls.lydo.clearValidators();
      this.formSearch.controls.lydo.updateValueAndValidity();
      // lọc ra tên file theo id trong danh sách file
      let licenseName;
      const documentSelected = this.formSearch.controls.license.value;
      if (documentSelected) {
        licenseName = this.listOptionLicense.filter(license => license.id == documentSelected)[0].value;
      } else {
        licenseName = '';
      }
      res.forEach(file => {
        const license = {
          documentType: licenseName,
          documentTypeId: documentSelected,
          documentName: file.fileName,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileBase64: file.fileBase64,
          fullBase64: file.fullBase64
        };
        this.listDataProfile.push(license);
      });
      this.renderTable();
    });
  }

  getReason() {
    this._commonCRMService.getReason(ACTION_TYPE.CHAM_DUT_HD).subscribe(res => {
      this.dataReasonType = res.data;
    });
  }

  getFeesReason(actionTypeId) {
    this._commonCRMService.getFees(actionTypeId).subscribe(res => {
      const feeType = {
        fee: this._translateService.instant('contract.fee_change_title'), price: res.data.fee
      };
      this.dataFeesType.push(feeType);
      const feeTotal = {
        fee: this._translateService.instant('contract.total_fee'), price: res.data.fee
      };
      this.dataFeesType.push(feeTotal);
      this.tableFee.renderRows();
    });
  }

  actionEndContracts() {
    this.confirmDialog();
  }

  endContracts() {
    if (!this.formSearch.controls.lydo.value) {
      this._toastrService.warning(this.translateService.instant('common.invalid.reason'));
      return;
    }
    const cutomerid = this.selectedCustomer.custId;
    const body = {
      reasonId: this.formSearch.controls.lydo.value,
      actTypeId: ACTION_TYPE.CHAM_DUT_HD,
      contractIds: this.selection.selected.map(x => x.contractId),
      contractProfileDTOs: this.listDataProfile.map(x => {
        return {
          documentTypeId: x.documentTypeId,
          fileName: x.fileName,
          fileBase64: x.fileBase64
        };
      })
    };
    this._contractService.endContracts(body, cutomerid).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translate.instant('contractNew.success-end-contract'));
        this.totalRecord = 0;
        this.formSearch.reset();
        this.formInformation.reset();
        this.dateOfIssue = null;
        this.birthDayDate = null;
        this.selectedCustomer.custTypeId = CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC;
        this.selectedCustomer = {};
        this.value = null;
        this.listVehicleSource = [];
        this.dataSourceProfile = null;
        this.dataFeesType = [];
        this.formSearch.controls.lydo.clearValidators();
        this.formSearch.controls.lydo.updateValueAndValidity();
        this.selectedCustomer.custTypeId = CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC;
        this.selection.clear();
      } else {
        this._toastrService.warning(res.mess.description);
      }
    }, err => {
      this.toastr.error(this.translateService.instant('common.500Error'));
    });
  }

  viewProfile(row) {
    const checkExtension = row.documentName.split('.')[1];
    if (checkExtension != 'pdf') {
      this.openViewImageProfile(row);
    } else {
      this.openViewPdfProfile(row);
    }
  }

  openViewImageProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFileImageComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }

  openViewPdfProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFilePdfComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }
}
