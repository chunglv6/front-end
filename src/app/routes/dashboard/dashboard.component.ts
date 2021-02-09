import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CommonCRMService } from '@app/shared/services/common-crm.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  totalCustomer = 0;
  totalContract = 0;
  totalVehicle = 0;
  totalContractProfile = 0;
  constructor(
    public actr: ActivatedRoute,
    private _commonCRMService?: CommonCRMService,

  ) {
    super(actr, _commonCRMService);
  }

  ngOnInit() {
    this.getNumberDashboard();
  }

  getNumberDashboard() {
    this._commonCRMService.getCountDashboard().subscribe(res => {
      this.totalCustomer = res.data.totalCustomer;
      this.totalContract = res.data.totalContract;
      this.totalVehicle = res.data.totalVehicle;
      this.totalContractProfile = res.data.totalContractProfile;
    })
  }
}
