import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { CreateVehicleSuccessModel } from '@app/core/models/common.model';
import { ContractRegisterModel, CustomerInforModel, VehicleRegisterModel } from '@app/core/models/customer-register.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { Subscription } from 'rxjs';
import { RouteStore } from '../routes.store';
import { RegisterServicesStore } from './register-services.store';

@Component({
  selector: 'app-register-services',
  templateUrl: './register-services.component.html',
  styleUrls: ['./register-services.component.scss']
})
export class RegisterServicesComponent extends BaseComponent implements OnInit, OnDestroy {
  index = 0;
  isSaved = false;
  fullName = '';
  currentStep = 0;
  @ViewChild('stepper') stepper: MatStepper;
  subscriptions: Subscription = new Subscription();

  constructor(
    public actr: ActivatedRoute,
    private registerServicesStore: RegisterServicesStore,
    private routeStore: RouteStore,
  ) {
    super(actr, null, RESOURCE.CUSTOMER);
  }

  ngOnInit() {
    // this.checkDataCache();
    const customer$ = this.registerServicesStore.currentCustomerInfor$.subscribe((res: CustomerInforModel) => {
      if (res) {
        this.stepper.next();
      }
    });
    const contract$ = this.registerServicesStore.currentContractInfor$.subscribe((res: ContractRegisterModel) => {
      if (res) {
        this.stepper.next();
      }
    });
    const vehicle$ = this.registerServicesStore.currentVehicleInfor$.subscribe((res: VehicleRegisterModel) => {
      if (res) {
        this.isSaved = res.isSave;
        if (this.isSaved) {
          this.index = 3;
        }
      }
    });
    this.routeStore.currentBackToRegisterVehicle$.subscribe((res: boolean) => {
      if (res) {
        this.nextToRegisterVehicle();
      }
    });
    this.routeStore.currentBackToRegisterContract$.subscribe((res: boolean) => {
      if (res) {
        this.nextToRegisterContract();
      }
    });
    this.registerServicesStore.currentNextToCustomerManageInfor$.subscribe((res: boolean) => {
      if (res) {
        this.isSaved = res;
        if (this.isSaved) {
          this.index = 3;
        }
      }
    });
    this.routeStore.sendToCustomerInfor$.subscribe((res: CreateVehicleSuccessModel) => {
      if (res) {
        this.backToRegisterForm(true);
      } else {
        this.backToRegisterForm(false);
      }
    });
    this.routeStore.changeImportVehicleSuccess$.subscribe(rs => {
      this.isSaved = rs;
      if (this.isSaved) {
        this.index = 3;
      }
    });
    this.subscriptions.add(customer$);
    this.subscriptions.add(contract$);
    this.subscriptions.add(vehicle$);
  }

  backToRegisterForm(value) {
    this.isSaved = value;
    if (this.isSaved) {
      this.index = 3;
    }
  }

  backToRegisterFormInfo(value) {
    this.currentStep = 0;
    this.index = this.currentStep;
    this.isSaved = value;
    if (this.isSaved) {
      this.index = 3;
    }
  }

  onReceiveFullName(value) {
    this.fullName = value;
  }

  nextToRegisterVehicle() {
    this.isSaved = false;
    this.currentStep = 2;
    this.index = this.currentStep;
  }

  nextToRegisterContract() {
    this.isSaved = false;
    this.currentStep = 1;
    this.index = this.currentStep;
  }

  checkDataCache() {
    if (AppStorage.get('step-register-service') == 0) {
      this.isSaved = false;
      this.currentStep = 0;
      this.index = this.currentStep;
    } else if (AppStorage.get('step-register-service') == 1) {
      this.isSaved = false;
      this.currentStep = 1;
      this.index = this.currentStep;
    } else if (AppStorage.get('step-register-service') == 2) {
      this.isSaved = false;
      this.currentStep = 2;
      this.index = this.currentStep;
    }
    else {
      this.isSaved = true;
    }
  }

  ngOnDestroy() {
    this.registerServicesStore.changeNextToCustomerManage(null);
    this.registerServicesStore.changeCustomerInfor(null);
    this.routeStore.changeBackToRegisterVehicle(null);
    this.routeStore.changeBackToRegisterContract(null);
    this.subscriptions.unsubscribe();
  }
  setIndex(index) {
    this.index = index.selectedIndex;
  }
}
