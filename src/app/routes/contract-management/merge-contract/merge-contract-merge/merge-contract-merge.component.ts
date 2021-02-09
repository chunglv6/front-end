import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { MtxGridColumn } from '@ng-matero/extensions';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { SelectionModel } from '@angular/cdk/collections';
import { PeriodicElement } from '@app/routes/customer-management/buy-ticket/buy-ticket.component';
import { ContractService } from '@app/core/services/contract/contract.service';
import { ToastrService } from 'ngx-toastr';
import { STATUS_CONTRACT, gender, ACTION_TYPE, HTTP_CODE, CUSTOMER_TYPE_ID } from '@app/shared/constant/common.constant';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'merge-contract-merge',
  templateUrl: './merge-contract-merge.component.html',
  styleUrls: ['./merge-contract-merge.component.scss']
})
export class MergeContractMergeComponent extends BaseComponent implements OnInit {
  dataReasonType: any;
  dataFeesType = [];
  selectedDocument: string;
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  displayedColumnsVehiclesMerge: string[] = ['orderNumberVehicleMerge', 'contractNo', 'signName', 'signDate', 'status', 'button', 'select'];
  displayedColumnsFee = ['fee', 'price'];
  @ViewChild('tableFee') tableFee: MatTable<any>;
  @ViewChild('tableVehicleMerge') tableVehicleMerge: MatTable<any>;
  listVehicleSource = [];
  columnsVehiclesMerge: MtxGridColumn[];
  selection = new SelectionModel<any>(true, []);
  formSearch: FormGroup;
  selectContract: any = {};
  columnsFee: MtxGridColumn[];
  selectedCustomer: any = {};
  states = [];
  value: string;
  filteredStates = this.states;
  contractId: number;
  customerId: number;
  isDisbaledMergeContract = true;
  selectLicence: number;
  CUSTOMER_TYPE_ID = CUSTOMER_TYPE_ID;

  listDataProfile = [];
  displayedColumnsProfile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  columnsProfile: MtxGridColumn[];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  indexPaginator = 0;
  pageSizeList = [10, 20, 50, 100];

  birthDayDate: string;
  dateOfIssue: string;
  signDate: string;
  isLoadingAuto: boolean;
  formInformation: FormGroup;

  actReasonId: number;

  constructor(
    protected _translateService: TranslateService,
    private _contractService: ContractService,
    protected _translate: TranslateService,
    private _commonCRMService: CommonCRMService,
    protected translateService: TranslateService,
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    private _customerInfoService: CustomerService,
    private _toastrService: ToastrService,

  ) {
    super(actr, _customerInfoService, RESOURCE.CONTRACT);

    this.columnsVehiclesMerge = [
      { i18n: 'common.orderNumber', field: 'orderNumberVehicleMerge' },
      { i18n: 'contractDetach.contract-number', field: 'contractNo' },
      { i18n: 'contractDetach.sign-employee', field: 'signName' },
      { i18n: 'contractDetach.sign-date', field: 'signDate' },
      { i18n: 'common.status', field: 'status' }
    ];
    super.mapColumn();
  }

  ngOnInit() {
    this.isLoading = false;

    this.formInformation = this.fb.group({
      searchContract: ['', Validators.required],
    });

    this.formSearch = this.fb.group({
      chungtu: [''],
      license: [''],
      lydo: ['', Validators.required],
    });

    this._translate.get('customer-management.formCaculateChangeFee').subscribe(res => {
      this.columnsFee = [
        { i18n: res.feeType, field: 'fee', disabled: true },
        { i18n: res.price, field: 'price', disabled: true },
      ];
    });

    this.getListDocumentTypeObject();
    this.getReason();
    this.getFees(ACTION_TYPE.GOP_HD);
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
    const dialogData = new ConfirmDialogModel(this.translateService.instant('customer.notification'), this.translateService.instant('contractNew.confirm-merge-contract'));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.mergeContract();
      }
    });
  }

  getReason() {
    const actTypeId = ACTION_TYPE.GOP_HD;
    this._commonCRMService.getReason(actTypeId).subscribe(res => {
      this.dataReasonType = res.data;
    });
  }

  getFees(actionTypeId) {
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

  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.GOP_HD).subscribe(res => {
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
      this.formSearch.controls.lydo.setValidators([Validators.required]);
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

  async filter(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStates = [];
    const data = (await this._customerInfoService.searchCustomerInfo(value).toPromise()).data;
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

  getData() {
    this._contractService.searchAllContracts({ custId: this.selectedCustomer.custId }).subscribe(res => {
      this.listVehicleSource = res.data.listData.filter(data => data.status == STATUS_CONTRACT.HOATDONG);
      this.totalRecord = this.listVehicleSource.length;
    });
  }

  clickRatio(record) {
    this.contractId = record.contractId;
    this.checkValidate();
  }

  checkItem(item) {
    this.selection.toggle(item);
    this.checkValidate();
  }

  // check trùng hai hợp đồng
  checkValidate() {
    if (this.contractId) {
      const isExists = this.selection.selected.filter(obj => obj.contractId == this.contractId);
      if (isExists.length > 0) {
        this.isDisbaledMergeContract = true;
      } else {
        if (this.selection.selected.length == 0) {
          this.isDisbaledMergeContract = true;
        } else {
          this.isDisbaledMergeContract = false;
        }
      }
    } else {
      this.isDisbaledMergeContract = true;
    }
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

  actionMergeContract() {
    this.confirmDialog();
  }

  mergeContract() {
    const customerid = this.selectedCustomer.custId;
    const contractId = this.contractId;
    const obj = this.selection.selected.map(x => x.contractId);
    const body = {
      contractId: this.contractId,
      actTypeId: ACTION_TYPE.GOP_HD,
      reasonId: this.formSearch.controls.lydo.value,
      secondaryContractId: this.selection.selected.map(x => x.contractId),
      contractProfiles: this.listDataProfile.map(x => {
        return {
          documentTypeId: x.documentTypeId,
          fileName: x.fileName,
          fileBase64: x.fileBase64
        };
      })
    };
    this._contractService.mergeContracts(body, customerid, contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translate.instant('contractNew.success-merge-contract'));
        this.formSearch.reset();
        this.formInformation.reset();
        this.dateOfIssue = null;
        this.birthDayDate = null;
        this.selectedCustomer.custTypeId = CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC;
        this.value = null;
        this.dataFeesType = [];
        this.listVehicleSource = [];
        this.dataSourceProfile = null;
        this.selectedCustomer = {};
        this.totalRecord = 0;
        this.isDisbaledMergeContract = true;
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
