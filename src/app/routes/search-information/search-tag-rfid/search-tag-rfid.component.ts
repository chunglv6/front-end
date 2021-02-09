
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MtxDialog } from '@ng-matero/extensions';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { RESOURCE, PERMISSION } from '@app/core';
import { BriefCaseService } from '@app/core/services/briefcase/brief-case.service';
import { TagRfidDetailComponent } from '../tag-rfid-detail/tag-rfid-detail.component';

@Component({
  selector: 'app-search-tag-rfid',
  templateUrl: './search-tag-rfid.component.html',
  styleUrls: ['./search-tag-rfid.component.css']
})
export class SearchTagRFIDComponent extends BaseComponent implements OnInit {
  formSearch: FormGroup;
  listAction = [];
  resultList: MatTableDataSource<any>;

  listCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    public actr: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private briefCaseService: BriefCaseService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public sharedDirectoryService?: SharedDirectoryService
  ) {
    super(actr, briefCaseService, RESOURCE.CUSTOMER, toastr, translateService, dialog);
  }

  ngOnInit() {
    this.getListCustomerType();
    this.buildForm();
    this.columns = [
      { header: this.translateService.instant('common.orderNumber'), field: 'orderNumber' },
      { header: this.translateService.instant('customer-management.vehiclesHaveRFIDTable.serialNumber'), field: 'serialNumber' },
      { header: this.translateService.instant('search-information.codeEpc'), field: 'codeEpc' },
      { header: this.translateService.instant('search-information.save-warehouse'), field: 'saveWarehouse' },
      { header: this.translateService.instant('search-information.type-card'), field: 'typeCard' },
      { header: this.translateService.instant('search-information.dateInput'), field: 'dateInput' },
      { header: this.translateService.instant('customer-management.changeLockModalForm.cardStatus'), field: 'cardStatus' },
      { header: this.translateService.instant('common.action'), field: 'action' }
    ];
    super.mapColumn();
    this.displayedColumns = this.columns.map(x => x.field);
    const data = [
      {
        serialNumber: '001HSO320',
        codeEpc: '01',
        saveWarehouse: 'Kho A',
        typeCard: 'Dán kính',
        dateInput: '11/05/2020',
        cardStatus: 'Mới',
      },
      {
        serialNumber: '001HSO555',
        codeEpc: '01222',
        saveWarehouse: 'Kho B',
        typeCard: 'Dán đèn',
        dateInput: '11/05/2020',
        cardStatus: 'Đã kích hoạt',
      },
      {
        serialNumber: '001HSO320',
        codeEpc: '01',
        saveWarehouse: 'Kho A',
        typeCard: 'Dán kính',
        dateInput: '11/05/2020',
        cardStatus: 'Mới',
      },
      {
        serialNumber: '001HSO555',
        codeEpc: '01222',
        saveWarehouse: 'Kho B',
        typeCard: 'Dán đèn',
        dateInput: '11/05/2020',
        cardStatus: 'Đã kích hoạt',
      },
      {
        serialNumber: '001HSO320',
        codeEpc: '01',
        saveWarehouse: 'Kho A',
        typeCard: 'Dán kính',
        dateInput: '11/05/2020',
        cardStatus: 'Mới',
      },
      {
        serialNumber: '001HSO555',
        codeEpc: '01222',
        saveWarehouse: 'Kho B',
        typeCard: 'Dán đèn',
        dateInput: '11/05/2020',
        cardStatus: 'Đã kích hoạt',
      }
    ]
    this.resultList = new MatTableDataSource(data);
    this.cdr.detectChanges();
    this.resultList.paginator = this.paginator;
  }
  getListCustomerType() {
    this.sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listCustomerType = res.data.map(val => {
        return {
          code: val.code,
          value: val.name
        }
      });
    });
  }
  buildForm() {
    this.formSearch = this.fb.group({
      warehouseCard: [''],
      seriNumber: [''],
      codeEpc: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['']
    });
  }
  processSearch() { }
  processExportFile() { }
  viewDetail(record?) {
    this.dialog.open({
      width: '1000px',
      height: '500px',
      data: { record },
    }, TagRfidDetailComponent);
  }

}
