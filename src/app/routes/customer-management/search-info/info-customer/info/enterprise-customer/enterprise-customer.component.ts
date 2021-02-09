import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { gender } from '@app/shared/constant/common.constant';

@Component({
  selector: 'app-enterprise-customer-search',
  templateUrl: './enterprise-customer.component.html',
  styleUrls: ['./enterprise-customer.component.scss'],
})
export class EnterpriseCustomerComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() dataCustomer: any = {};
  constructor() {
    super();
  }
  ngOnInit() {}
  bindData() {
    if (this.dataCustomer.repGender) {
      this.dataCustomer.repGender = gender.find(x => x.code === this.dataCustomer.repGender).value;
    }
    if (this.dataCustomer.authGender) {
      this.dataCustomer.authGender = gender.find(
        x => x.code === this.dataCustomer.authGender
      ).value;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    this.bindData();
  }
}
