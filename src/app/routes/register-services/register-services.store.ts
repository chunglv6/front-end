import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomerInforModel, ContractRegisterModel, VehicleRegisterModel, RepresentativeEnterpriseModel } from '@app/core/models/customer-register.model';
import { SelectOptionModel, CreateVehicleSuccessModel } from '@app/core/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterServicesStore {

  private _customerInfor = new BehaviorSubject<CustomerInforModel>(null);
  currentCustomerInfor$ = this._customerInfor.asObservable();

  private _contractInfor = new BehaviorSubject<ContractRegisterModel>(null);
  currentContractInfor$ = this._contractInfor.asObservable();

  private _vehicleInfor = new BehaviorSubject<VehicleRegisterModel>(null);
  currentVehicleInfor$ = this._vehicleInfor.asObservable();

  private _listOptionCity = new BehaviorSubject<SelectOptionModel[]>(null);
  currentListOptionCity$ = this._listOptionCity.asObservable();

  private _listOptionDistrict = new BehaviorSubject<SelectOptionModel[]>(null);
  currentListOptionDistrict$ = this._listOptionDistrict.asObservable();

  private _listOptionWard = new BehaviorSubject<SelectOptionModel[]>(null);
  currentListOptionWard$ = this._listOptionWard.asObservable();

  private _listOptionCustomerType = new BehaviorSubject<SelectOptionModel[]>(null);
  currentListOptionCustomerType$ = this._listOptionCustomerType.asObservable();

  private _listOptionDocumentType = new BehaviorSubject<SelectOptionModel[]>(null);
  currentListOptionDocumentType$ = this._listOptionDocumentType.asObservable();

  private _representativeEnterprise = new BehaviorSubject<RepresentativeEnterpriseModel>(null);
  currentRepresentativeEnterprise$ = this._representativeEnterprise.asObservable();

  private _createVehicleSuccess = new BehaviorSubject<CreateVehicleSuccessModel>(null);
  currentCreateVehicleSuccess$ = this._createVehicleSuccess.asObservable();

  private _listOptionGroupVehicles = new BehaviorSubject<SelectOptionModel[]>(null);
  currentListOptionGroupVehicles$ = this._listOptionGroupVehicles.asObservable();

  private _nextToCustomerManageInfor = new BehaviorSubject<boolean>(null);
  currentNextToCustomerManageInfor$ = this._nextToCustomerManageInfor.asObservable();

  // private _importVehicleSuccess = new BehaviorSubject<CreateVehicleSuccessModel>(null);
  // currentImportVeicleSuccess$ = this._importVehicleSuccess.asObservable();

  private _listOptionVehicleType = new BehaviorSubject<SelectOptionModel[]>(null);
  currentListOptionVehicleType$ = this._listOptionVehicleType;

  private _detailCustomerRegister = new BehaviorSubject<any>(null);
  currentDetailCustomerRegister$ = this._detailCustomerRegister.asObservable();

  constructor() { }

  changeCustomerInfor(customer: CustomerInforModel) {
    this._customerInfor.next(customer);
  }

  changeContractInfor(contract: ContractRegisterModel) {
    this._contractInfor.next(contract);
  }

  changeVehicleInfor(vehicle: VehicleRegisterModel) {
    this._vehicleInfor.next(vehicle);
  }

  changeListOptionCity(options: SelectOptionModel[]) {
    this._listOptionCity.next(options);
  }

  changeListOptionDistrict(options: SelectOptionModel[]) {
    this._listOptionDistrict.next(options);
  }

  changeListOptionWard(options: SelectOptionModel[]) {
    this._listOptionWard.next(options);
  }

  changeListOptionCustomerType(options: SelectOptionModel[]) {
    this._listOptionCustomerType.next(options);
  }

  changeListOptionGroupVehicles(options: SelectOptionModel[]) {
    this._listOptionGroupVehicles.next(options);
  }

  changeListOptionDocumentType(options: SelectOptionModel[]) {
    this._listOptionDocumentType.next(options);
  }

  changeRepresentativeEnterprise(repEnterprise: RepresentativeEnterpriseModel) {
    this._representativeEnterprise.next(repEnterprise);
  }

  changeCreateVehicleSuccess(param: CreateVehicleSuccessModel) {
    this._createVehicleSuccess.next(param);
  }

  changeNextToCustomerManage(value: boolean) {
    this._nextToCustomerManageInfor.next(value);
  }

  // changeImportVehicleSuccess(param: CreateVehicleSuccessModel) {
  //   this._importVehicleSuccess.next(param);
  // }

  changeListOptionVehicleType(options: SelectOptionModel[]) {
    this._listOptionVehicleType.next(options);
  }

  changeDetailCustomerRegister(customer: any) {
    this._detailCustomerRegister.next(customer);
  }

}
