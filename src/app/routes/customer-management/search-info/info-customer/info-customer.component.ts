import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';

@Component({
  selector: 'info-customer',
  templateUrl: './info-customer.component.html',
  styleUrls: ['./info-customer.component.scss'],
})
export class InfoCustomerComponent extends BaseComponent implements OnInit, OnChanges {
  selectedNode: any = {};
  @Input() dataSourceTree = [];
  @Input() isClickSearch = true;
  currentIndex = 0;
  constructor(public actr: ActivatedRoute, public dialog: MtxDialog) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.selectedNode = {};
  }
  ngOnInit() { }
  onTabCustomerChange(event: any) {
    switch (event.index) {
      case 0: {
        this.currentIndex = 0;
        break;
      }
      case 1: {
        this.currentIndex = 1;
        this.dataModel.initContractList = true;
        break;
      }
      case 2: {
        this.currentIndex = 1;
        this.dataModel.initActionAudit = true;
        break;
      }
    }
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
  onTabVehicleChange(event) {
    switch (event.index) {
      case 1: {
        this.dataModel.initVehicleAttachList = true;
        break;
      }
      case 2: {
        this.dataModel.initVehicleActionAudit = true;
        break;
      }
      case 3: {
        this.dataModel.initVehicleRfidHistory = true;
        break;
      }
      case 4: {
        this.dataModel.accountHistory = true;
        break;
      }
    }
  }
  selectNode(event) {
    if (event !== this.selectedNode) {
      this.selectedNode = event;
    }
    switch (event.type) {
      case 1: {
        this.dataModel.initCustomerView = true;
        this.dataModel.initContractView = false;
        this.dataModel.initVehicleView = false;
        break;
      }
      case 2: {
        this.dataModel.initContractView = true;
        this.dataModel.initCustomerView = false;
        this.dataModel.initVehicleView = false;
        break;
      }
      case 3: {
        this.dataModel.initVehicleView = true;
        this.dataModel.initContractView = false;
        this.dataModel.initCustomerView = false;
        break;
      }
    }
  }
  getMaxHeight() {
    return (window.innerHeight - 200).toString() + 'px';
  }
}
