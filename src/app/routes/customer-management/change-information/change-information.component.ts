import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';

@Component({
  selector: 'app-change-information',
  templateUrl: './change-information.component.html',
  styleUrls: ['./change-information.component.scss'],
})
export class ChangeInformationComponent extends BaseComponent implements OnInit {
  formSearch: FormGroup;
  listCustomer: any;
  dataSourceTree = [];
  constructor(
    private fb: FormBuilder,
    private _customerManager?: CustomerService,
    private act?: ActivatedRoute
  ) {
    super(act, null, RESOURCE.CUSTOMER);
    this.formSearch = this.fb.group({
      documentNumber: [''],
      plateNumber: [''],
      phoneNumber: [''],
    });
  }

  ngOnInit() {
    this.processSearchCustomer();
  }

  public processSearchCustomer(): void {
    let params: any = {};
    params.startrecord = 0;
    params.pagesize = 20;
    if (this.formSearch.get("documentNumber").value) {
      params.documentNumber = this.formSearch.get("documentNumber").value;
    }

    if (this.formSearch.get("plateNumber").value) {
      params.plateNumber = this.formSearch.get("plateNumber").value;
    }
    if (this.formSearch.get("phoneNumber").value) {
      params.phoneNumber = this.formSearch.get("phoneNumber").value;
    }


    this._customerManager.searchAllCustomers(params).subscribe(res => {
      if (res.mess.code == 1) {
        this.dataSourceTree = res.data.listData;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }
}
