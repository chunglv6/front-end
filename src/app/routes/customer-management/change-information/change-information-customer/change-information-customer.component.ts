import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { RESOURCE } from '@app/core';
import { ContractService } from '@app/core/services/contract/contract.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';

@Component({
  selector: 'app-change-information-customer',
  templateUrl: './change-information-customer.component.html',
  styleUrls: ['./change-information-customer.component.scss'],
})
export class ChangeInformationCustomerComponent extends BaseComponent implements OnChanges, OnInit {
  @Input() dataSourceTree = [];
  indexTab;
  selectedNode: any = {};
  constructor(private _contractDetailManager: ContractService) {
    super(null, null, RESOURCE.CUSTOMER);
  }

  ngOnInit() { }

  selectNode(event) {
    this.indexTab = event.type;
    this.selectedNode = event;
  }

  onTabCustomerChange(tab) { }
  ngOnChanges() {
    this.dataModel.dataSourceTree = this.dataSourceTree;
  }
  onTabContractChange(event: any) {
    switch (event.index) {
      case 1: {
        this.dataModel.initVehicleList = true;
        break;
      }
      case 2: {
        this.dataModel.initAttachList = true;
        break;
      }
      case 3: {
        this.dataModel.initcontractActionAuditList = true;
        break;
      }
      case 4: {
        this.dataModel.initContractAccountHistory = true;
        break;
      }
      case 5: {
        this.dataModel.initContractBillingHistory = true;
        break;
      }
    }
  }
}
